# AXERA-TECH/Qwen3.5-9B-AX8860-llama.cpp

## Resumen

Qwen3.5-9B-AX8860-llama.cpp es una distribución empaquetada del modelo Qwen3.5-9B de Alibaba Qwen, adaptada por AXERA-TECH para ejecutarse sobre la NPU del SoC Axera AX8860 mediante llama.cpp y un backend propio de kernels NPU denominado ggml-axera. No se trata de un modelo nuevo: los pesos derivan del modelo base Qwen/Qwen3.5-9B (9.197.093.888 parámetros), cuantizados en formato GGUF mxfp4 (6,00 GB) y acompañados de un codificador visual separado en bf16 (921 MB), lo que confirma que el modelo base es multimodal texto-imagen.

Su relevancia es de despliegue: demuestra inferencia de un modelo de 9B con entrada de imagen sobre hardware de borde (edge) con 4 núcleos NPU, alcanzando 43,7 tokens/s en decodificación simple y hasta 76,6 tokens/s con decodificación especulativa MTP adaptativa, además de 2.959 tokens/s de prefill y una ventana de contexto configurable de hasta 262.144 tokens. El paquete incluye binarios estáticos para la placa, kernels NPU, scripts de ejecución y un servidor compatible con la API de OpenAI.

La ficha se centra en lo que el repositorio documenta: rendimiento medido en el AX8860, requisitos de SDK (V0.5.1 o superior), formato de pesos y limitaciones operativas. Los datos sobre entrenamiento, licencia, idiomas y benchmarks académicos no aparecen en la información disponible y se indican como tales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.5-9B); multimodal texto-imagen con codificador visual separado; decodificación especulativa MTP opcional |
| Parámetros totales | 9.197.093.888 (9,2 B) |
| Parámetros activos | no disponible (no se documenta que sea MoE) |
| Longitud de contexto | hasta 262.144 tokens (por defecto en servidor: 16.384; configurable con `CTX`) |
| Tipos de cuantización | mxfp4 para pesos (GGUF, 6,00 GB); bf16 para el codificador visual |
| Idiomas soportados | no disponible (los escenarios de prueba incluyen chino e inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (`qwen3.5-9b-mxfp4.gguf`, `mmproj-qwen3.5-9b-bf16.gguf`) |
| Tamaño del repositorio | 8,0 GB |
| Librería | llama.cpp (backend ggml-axera) |
| Hardware objetivo | NPU Axera AX8860, SDK V0.5.1 o superior |
| Servidor | compatible con API OpenAI (`run.sh -s`) |

## Arquitectura y entrenamiento

El repositorio no documenta el proceso de entrenamiento del modelo base; solo indica que se trata de Qwen/Qwen3.5-9B y que los pesos se han cuantizado a mxfp4 para su ejecución en la NPU. Por los artefactos publicados se deduce una arquitectura transformer multimodal: un modelo de lenguaje de 9,2 B parámetros más un codificador visual independiente (`mmproj-qwen3.5-9b-bf16.gguf`, 921 MB) que se carga por separado y permite entrada de imágenes junto con texto.

La innovación técnica relevante está en la capa de despliegue. El paquete incluye kernels NPU propios con un `manifest.json`, binarios de llama.cpp enlazados estáticamente para la placa y un fork de llama.cpp (`ZHEQIUSHUI/llama.cpp`, rama `axera-dev`, commit `6613735ce`). Sobre esa base se añade MTP (multi-token prediction) como decodificación especulativa opcional: cada borrador se verifica token a token contra el modelo objetivo, de modo que la salida en modo greedy es idéntica a la decodificación normal. El modo adaptativo (`MTP=1`) activa o desactiva la especulación según la aceptación observada, con tasas de aceptación entre 0,267 y 0,816 según el tipo de contenido. El servidor usa por defecto el chat template incluido (`chat_template.jinja`), desactiva el modo de razonamiento (`--reasoning off`) y admite mensajes de sistema en mitad de la conversación para clientes de agentes.

## Capacidades

- Generación de texto conversacional y de completado, con decodificación greedy o muestreada.
- Comprensión de imágenes: descripción de escenas, vehículos, texto en imagen y personas, según las pruebas de corrección del autor.
- Contexto largo de hasta 262.144 tokens, con caché de prompt en memoria de host (4 GB por defecto) o en disco mediante `CACHE_DIR`.
- Servidor compatible con la API de OpenAI, lo que habilita su uso con clientes que hablan ese protocolo.
- Soporte de clientes de agentes: el servidor acepta mensajes de sistema intercalados en la conversación (se cita Codex como ejemplo).
- Modo de razonamiento (thinking) presente en el modelo base, desactivado por defecto en el servidor.
- Traducción chino-inglés verificada en los escenarios de rendimiento.
- Decodificación especulativa MTP opcional con verificación por el modelo objetivo.
- No se documenta soporte explícito de tool calling ni de audio en la información disponible.

## Casos de uso

- Inferencia en el borde con privacidad de datos: el paquete permite ejecutar un modelo de 9B con entrada de imagen íntegramente en un SoC AX8860, sin enviar prompts ni imágenes a servicios externos, lo que encaja en entornos industriales o sanitarios con requisitos de confidencialidad.
- Asistente de descripción de imágenes en dispositivos: con el codificador visual incluido y 2.959 tokens/s de prefill, se pueden procesar imágenes y generar descripciones en pocos segundos; útil en inspección visual, accesibilidad o catalogación de fotos.
- Procesamiento de documentos largos: la ventana de 262.144 tokens permite resumir o extraer información de expedientes, contratos o manuales extensos, con caché de prompt en SSD para reutilizar prefijos entre reinicios.
- Servicio local compatible con OpenAI: al exponer la API de OpenAI en el puerto indicado (`sh run.sh -s 8080`), se puede conectar a herramientas existentes (clientes de chat, frameworks de agentes) sin adaptadores propietarios.
- Traducción automática chino-inglés: los escenarios del autor muestran 67,9 tokens/s con MTP adaptativo en traducción, lo que hace viable traducir documentos de forma interactiva en el propio dispositivo.
- Generación de código asistida en entornos sin conectividad: los escenarios de código alcanzan 58,7 tokens/s con MTP adaptativo (aceptación 0,595), suficiente para autocompletado y generación de fragmentos en un IDE local.
- Automatización de agentes con contexto largo: la aceptación de mensajes de sistema intermedios y el modo de razonamiento desactivable permiten integrar el modelo como backend de clientes de agentes que gestionan conversaciones multi-turno extensas.

## Benchmarks y rendimiento

Los datos publicados son mediciones de inferencia en el AX8860, no benchmarks académicos. Se reproducen a continuación.

Rendimiento base y con MTP (tokens/s, hasta 256 tokens por prueba, greedy salvo indicación):

| Contenido | Sin MTP | MTP adaptativo | MTP forzado | Aceleración | Tasa de aceptación |
|---|---:|---:|---:|---:|---:|
| Código | 43,6 | 58,7 | 61,9 | 1,35x | 0,595 |
| Traducción (chino-inglés) | 43,0 | 67,9 | 64,1 | 1,58x | 0,691 |
| Tabla Markdown | 43,7 | 76,6 | 77,1 | 1,75x | 0,816 |
| Matemáticas | 43,5 | 66,3 | 66,0 | 1,52x | 0,667 |
| Ensayo en chino | 43,7 | 43,4 | 47,3 | 0,99x | 0,369 |
| Relato en inglés | 43,4 | 42,3 | 47,3 | 0,97x | 0,376 |
| Código con muestreo | 42,7 | 42,1 | 39,4 | 0,98x | 0,444 |
| Ensayo con muestreo | 43,2 | 42,9 | 28,7 | 0,99x | 0,267 |
| Lista de comandos Linux | 43,1 | 54,2 | 55,1 | 1,26x | 0,500 |
| Explicación en chino | 42,8 | 43,2 | 50,5 | 1,01x | 0,433 |

Rendimiento de prefill y decodificación según longitud de prompt (`bench.sh`, 128 tokens generados):

| Prompt | `-c` | Tiempo de prompt | Decodificación (tokens/s) |
|---|---:|---:|---:|
| 5 tokens | 8192 | 0,11 s | — |
| 47 tokens | 8192 | 0,11 s | — |
| 3.908 tokens | 8192 | 1,32 s | 41,9 |
| 5 tokens | 262144 | 0,11 s | — |
| 47 tokens | 262144 | 0,11 s | — |
| 3.908 tokens | 262144 | 1,31 s | 41,5 |
| 3.908 tokens, muestreo | 8192 | 1,32 s | 41,5 |

Perplejidad reportada: 20,8654 (`-ub 1`) y 20,8061 (`-ub 4`) sobre `ppl_zh.txt` de 2 chunks; 23,7616 y 23,7930 sobre `ppl_zh_long.txt` de 20 chunks. No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Hardware obligatorio: SoC Axera AX8860 con SDK V0.5.1 o superior; el runtime ocupa los 4 núcleos NPU en exclusiva.
- No se ejecuta en GPU convencional: los binarios de `bin/` están enlazados estáticamente para la placa y dependen de los kernels NPU incluidos.
- Memoria de host: la caché de prompt reside por defecto en 4 GB de RAM; puede redirigirse a SSD con `CACHE_DIR`.
- Almacenamiento: pesos de 6,00 GB (mxfp4) más 921 MB del codificador visual, sobre un repositorio de 8,0 GB.
- Despliegue: scripts `run.sh` (texto, imagen, chat interactivo, servidor OpenAI) y `bench.sh` para reproducir rendimiento; llama-bench disponible con `-b 4096 -ub 4096`.
- Throughput: 43,7 tokens/s en decodificación simple; 76,6 tokens/s con MTP adaptativo en tablas Markdown; 2.959 tokens/s de prefill para 3.908 tokens.
- Servidor: `-np 1` (una sola petición paralela), contexto por defecto de 16.384 tokens ampliable con `CTX`.
- No se dispone de estimaciones de VRAM para GPU porque el paquete no está pensado para ese hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Hardware objetivo | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.5-9B-AX8860-llama.cpp (este) | 9,2 B | hasta 262.144 | NPU Axera AX8860 | mxfp4 + bf16 (visión) | no disponible | Hugging Face, 2.252 descargas |
| Qwen/Qwen3.5-9B (modelo base) | 9,2 B | no disponible en esta información | GPU/CPU genéricas | según repositorio original | no disponible | Hugging Face |
| Otras distribuciones GGUF de Qwen3.5-9B para llama.cpp | 9,2 B | según configuración | CPU/GPU | GGUF (q4, q8, etc.) | no disponible | Hugging Face |

La comparación con alternativas de la misma categoría (modelos de 9B con visión para borde) no está disponible en la información proporcionada. La diferencia principal de este paquete frente al modelo base y frente a GGUF genéricos es el backend NPU específico, el codificador visual empaquetado y la decodificación especulativa MTP con métricas publicadas.

## Limitaciones y advertencias

- Dependencia de hardware: solo funciona en AX8860 con SDK V0.5.1 o superior; no es portable a GPU ni a otras NPU sin recompilar kernels y binarios.
- Licencia no declarada en el repositorio: antes de uso comercial debe verificarse la licencia del modelo base Qwen/Qwen3.5-9B y la del fork de llama.cpp utilizado.
- Idiomas soportados no documentados: las pruebas cubren chino e inglés; el rendimiento en castellano no está verificado.
- Modo de razonamiento desactivado por defecto en el servidor; para tareas que se beneficien de cadena de pensamiento hay que habilitarlo explícitamente.
- El MTP adaptativo no acelera todos los contenidos: en ensayos y relatos con muestreo la ganancia es nula o ligeramente negativa (0,97x-0,99x), y en modo forzado con muestreo puede degradar el rendimiento (28,7 tokens/s frente a 43,2).
- Las peticiones greedy deben incluir `presence_penalty: 0`; de lo contrario, la penalización recomendada por el servidor desactiva el greedy fusionado y el MTP adaptativo no se activa.
- Se documenta un fallo intermitente `ret = -3` en peticiones consecutivas en algunos entornos, que requiere reintento.
- Una sola petición concurrente en el servidor (`-np 1`) y uso exclusivo de los 4 núcleos NPU: no apto para servir a múltiples usuarios simultáneos.
- No se han publicado evaluaciones de sesgo, alucinación ni robustez; el modelo base es de 9,2 B y cabe esperar las limitaciones típicas de ese tamaño, pero no hay datos que las cuantifiquen.
- Los scripts descargados de Hugging Face no traen permiso de ejecución; deben invocarse con `sh`.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AXERA-TECH/Qwen3.5-9B-AX8860-llama.cpp
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Fork de llama.cpp utilizado (rama `axera-dev`, commit `6613735ce`): https://github.com/ZHEQIUSHUI/llama.cpp
