# cicaba/Unlimited-OCR-2-GGUF

## Resumen

Unlimited-OCR-2 GGUF es una cuantización en formato GGUF del modelo baidu/Unlimited-OCR-2 de Baidu, un modelo OCR unificado de tipo mixture-of-experts (MoE) con aproximadamente 2.940 millones de parámetros (2.938.670.848 en pesos safetensors), diseñado para convertir imágenes de páginas de documentos (escaneos, fotografías, páginas PDF) en texto con estructura de layout preservada. La cuantización, publicada por el usuario cicaba en HuggingFace, ofrece tres variantes (F16, Q8_0 y Q4_K_M) junto con el proyector del codificador de visión (SAM + CLIP) en un archivo mmproj separado.

El problema que resuelve es doble: por un lado, el OCR tradicional no preserva la estructura del documento (tablas, columnas, jerarquías); por otro, los modelos OCR de gran tamaño exigen hardware costoso. Al distribuirse en GGUF, el modelo puede ejecutarse localmente con llama.cpp, incluso en GPUs de consumo. Una particularidad relevante es que el modelo emplea atención dispersa enrutada DASH (SR-SWA) y RoPE 2D consciente de páginas, características que aún no están en el llama.cpp oficial, por lo que el repositorio incluye un parche propio para compilarlo.

Es relevante ahora porque la digitalización de documentos con estructura (informes, gráficos, documentos multilingües) es un caso de uso de IA muy demandado, y la licencia MIT del modelo base permite despliegues comerciales sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE unificado de OCR, vision-language (codificador de visión SAM + CLIP, atención dispersa DASH/SR-SWA, RoPE 2D por página) |
| Parametros totales | 2.938.670.848 (≈2,94 B) |
| Parametros activos | no disponible (es MoE, pero no se publica el número de expertos activos) |
| Longitud de contexto | 32.768 tokens (usado en los ejemplos de ejecución; máximo oficial no disponible) |
| Tipos de cuantizacion | F16 (5,5 GB), Q8_0 (3,0 GB), Q4_K_M (1,9 GB); el router DASH se mantiene en F16/F32 en todas las variantes |
| Idiomas soportados | no disponible |
| Licencia | MIT (heredada de baidu/Unlimited-OCR-2) |
| Formato de pesos | GGUF (conversión desde los pesos oficiales BF16 en safetensors) |

## Arquitectura y entrenamiento

El modelo base es un modelo OCR unificado de tipo mixture-of-experts que combina un codificador de visión basado en SAM y CLIP con un decodificador de lenguaje MoE. Dos innovaciones técnicas destacan en la model card: la atención dispersa enrutada DASH (SR-SWA, sparse routed sparse-window attention) y un RoPE 2D consciente de páginas (page-aware 2D RoPE), que permite derivar números y posiciones de página a partir del historial de tokens de una única secuencia. Esto explica la limitación de procesar una petición a la vez (`-np 1`) en llama.cpp.

Sobre el entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO) no hay datos disponibles en la información proporcionada. Respecto a la cuantización: se convirtió desde los pesos oficiales sin modificaciones, usando un conversor parcheado y `llama-quantize`. En la variante Q4_K_M, 12 tensores `ffn_down_exps` (ancho de fila 896, no múltiplo de 256) caen a Q8_0 porque los K-quants no aplican a esa forma. Las tres variantes fueron verificadas con `llama-mtmd-cli` en una Tesla P100 de 16 GB, produciendo salida idéntica entre F16, Q8_0 y Q4_K_M.

## Capacidades

- OCR de páginas de documentos completas: convierte escaneos, fotografías y páginas PDF en texto con bloques de layout estructurados (verificado con páginas densas en texto y gráficos).
- Parseo multipágina: instrucción por defecto `Multi page parsing.`, equivalente al runtime oficial de transformers/sglang.
- Entrada image-text-to-text: pipeline multimodal con proyector de visión (mmproj) requerido junto a cualquier archivo de pesos.
- Peticiones solo-imagen: la plantilla de chat embebida inyecta automáticamente la instrucción por defecto cuando el mensaje no contiene texto, sin doble inyección si ya hay texto o instrucciones personalizadas.
- Modos de visión: modo gundam con tiling de una sola página (más preciso, ~1,3 GB extra de VRAM) y modo base con `--image-max-tokens 273` (por defecto multipágina, más ligero).
- Servidor compatible con la API de OpenAI mediante `llama-server`, con cola de peticiones concurrentes (se serializan, nunca se descartan).
- No hay información sobre tool calling, generación de código, razonamiento general ni capacidades de audio.

## Casos de uso

- Digitalización de archivos documentales: conversión masiva de escaneos e imágenes de páginas a texto estructurado con layout preservado, adecuado para archivos, bibliotecas y digitalización de legado gracias a la licencia MIT.
- Extracción de tablas y gráficos: la model card verifica el modelo sobre páginas densas en texto y gráficos con bloques de layout completos, útil para extraer datos tabulares de informes en PDF.
- Pipelines RAG sobre documentos: el texto estructurado con jerarquía de layout mejora el chunking y la indexación posterior en sistemas de búsqueda semántica.
- API de OCR autoalojada: mediante `llama-server` se expone un endpoint compatible con OpenAI, integrable en servicios existentes sin depender de APIs de terceros ni enviar documentos sensibles a la nube.
- Procesamiento en hardware modesto: la variante Q4_K_M (1,9 GB) permite OCR local en GPUs de consumo pequeñas o incluso en portátiles, útil para herramientas de escritorio.
- Automatización de flujos de backoffice: parsing multipágina de facturas, contratos y formularios escaneados integrado en pipelines de automatización, con temperatura 0 para salida determinista.
- Procesamiento por lotes de PDFs: el encolado y serialización de peticiones concurrentes permite colas de trabajo sin pérdida de peticiones en un único servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única verificación cuantitativa mencionada es cualitativa: F16, Q8_0 y Q4_K_M producen salida idéntica entre sí en las pruebas con `llama-mtmd-cli` (un logotipo y una página densa en texto), con bloques de layout completos.

## Requisitos de hardware

- VRAM estimada para inferencia: F16 requiere 5,5 GB de pesos más el mmproj (788 MB) y la KV cache; Q8_0 unos 3,0 GB más mmproj; Q4_K_M unos 1,9 GB más mmproj. El modo gundam de visión añade ~1,3 GB extra frente al modo base.
- En GPUs de 16 GB sin soporte de flash-attention (por ejemplo Tesla P100), F16 necesita offload reducido (`-ngl 12 -c 8192`); Q8_0 y Q4_K_M se offload-ean completamente.
- GPU recomendadas: cualquier GPU NVIDIA moderna con CUDA (compilación con `-DGGML_CUDA=ON`); en Mac se usa Metal automáticamente. Verificado en Tesla P100 16G.
- Consumer GPUs: Q4_K_M y Q8_0 caben con holgura en GPUs de 8-12 GB (RTX 3060, RTX 4070, RTX 4090); F16 cabe en GPUs de 16 GB con flash-attention.
- Despliegue: llama.cpp (obligatoriamente compilado con el parche `unlimited-ocr2.patch` incluido en el repo, basado en el commit upstream `3c809f443`), mediante `llama-mtmd-cli` (CLI) o `llama-server` (API compatible con OpenAI). No se menciona soporte en Ollama, vLLM o TGI para estas builds GGUF.
- Latencia y throughput: no disponibles. Se recomienda `--temp 0`, `-n 8000` de salida máxima y `-c 32768` de contexto en los ejemplos.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Notas |
|---|---|---|---|---|
| cicaba/Unlimited-OCR-2-GGUF (este) | ≈2,94 B (MoE) | GGUF (F16/Q8_0/Q4_K_M) | MIT | Requiere llama.cpp parcheado; SR-SWA y RoPE 2D por página |
| baidu/Unlimited-OCR-2 (base) | ≈2,94 B (MoE) | safetensors (BF16) | MIT | Runtime oficial transformers/sglang; sin necesidad de parche |
| Otros OCR GGUF (p. ej. modelos tipo PaddleOCR-VL, GOT-OCR) | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes en la información proporcionada para una comparativa numérica de rendimiento con alternativas.

## Limitaciones y advertencias

- El llama.cpp oficial (mainline) no puede cargar estos archivos todavía: es imprescindible compilar con el parche incluido en el repositorio, anclado al commit `3c809f443`; el parche puede dejar de aplicar sobre versiones futuras.
- Procesamiento de una petición a la vez (`-np 1`): las peticiones concurrentes se encolan y serializan, lo que limita el throughput en producción; los números y posiciones de página dependen del historial de una única secuencia.
- No hay guard de no-repeat n-gram (el servidor oficial sí lo tiene): se recomienda limitar la salida con `-n` para evitar bucles en alguna página.
- El router DASH se mantiene en F16/F32 en todas las cuantizaciones, por lo que el tamaño real en memoria es algo mayor que el de los archivos de pesos de texto solos.
- Datos no disponibles: idiomas soportados, parámetros activos del MoE, benchmarks publicados y composición del dataset de entrenamiento.
- Alucinaciones: como en cualquier modelo OCR generativo, puede inventar contenido en zonas ilegibles o degradadas; la verificación de la model card se limita a dos imágenes de prueba.
- Licencia MIT sin restricciones de uso comercial conocidas, pero el repositorio es de un tercero (cicaba), no oficial de Baidu; para entornos críticos conviene validar contra los pesos oficiales de baidu/Unlimited-OCR-2.
- Descargas muy bajas (409) y cero likes en el momento de la ficha: proyecto comunitario joven (creado el 28 de octubre de 2026), con riesgo de abandono o de incompatibilidad con futuras versiones de llama.cpp.

## Enlaces

- Repositorio GGUF: https://huggingface.co/cicaba/Unlimited-OCR-2-GGUF
- Modelo base oficial: https://huggingface.co/baidu/Unlimited-OCR-2
- Espejo en ModelScope mencionado en la model card: https://modelscope.cn/models/PaddlePaddle/Unlimited-OCR-2
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- No se han encontrado enlaces a papers, blogs oficiales ni demos en la informacion disponible.
