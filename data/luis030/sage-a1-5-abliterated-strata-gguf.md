# luis030/Sage-A1.5-abliterated-Strata-GGUF

## Resumen

Sage-A1.5-abliterated-Strata-GGUF es un reempaquetado en formato GGUF Q4_K_M del modelo Sage-A1.5 de InternScience, en su variante "abliterated" publicada por SC117, es decir, con la dirección de rechazo eliminada del espacio de activaciones. El modelo original es un fine-tune de Qwen3.6-35B-A3B, un transformer de tipo Mixture-of-Experts con 256 expertos y top-8, capa MTP (multi-token prediction) y codificador de visión. El autor de este repositorio, luis030, no entrena ni modifica pesos: solo recuantiza el BF16 abliterated de SC117 al layout exacto que exige el motor de inferencia Strata (rama `q36-r2`), que necesita `ssm_alpha` y `ssm_beta` en BF16 y no acepta expertos en Q3_K.

La relevancia de esta ficha es doble. Por un lado, documenta un caso típico de la cadena de custodia de pesos en el ecosistema open source: un modelo base, un abliterated, un cuantizador intermedio y un reempaquetador final, cada uno con su propia licencia y sus propios riesgos. Por otro, el modelo resultante es un artefacto de inferencia muy específico: 35.505.251.456 parámetros totales, contexto declarado de 262.144 tokens en la configuración de ejemplo, decodificación especulativa vía MTP y soporte de visión, todo empaquetado en 20,2 GiB de pesos más 861 MiB de codificador visual.

Conviene subrayar que este repositorio no incluye benchmarks propios, ni evaluación de tasa de rechazo tras la cuantización, ni KL/perplejidad frente al BF16. Las únicas métricas publicadas son de velocidad en una máquina concreta (RTX 5080 de 16 GB, Ryzen 7 7700). El modelo está pensado para usuarios que ya tienen montado el motor Strata y quieren sustituir los pesos originales por los abliterated sin cambiar el resto del stack.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), familia Qwen3.6-35B-A3B, con capa MTP y codificador de visión; arquitectura declarada en el motor como `qwen35moe` |
| Parametros totales | 35.505.251.456 (35,5 mil millones) |
| Parametros activos | no disponible (el modelo base es top-8 sobre 256 expertos, pero no se publica el recuento exacto de parámetros activos) |
| Longitud de contexto | 262.144 tokens en la configuración de ejemplo del autor (`--max-context 262144`) |
| Tipos de cuantizacion | Q4_K_M (fichero publicado); se probó también IQ3_S por expertos (15,75 GiB) y se descartó por menor velocidad |
| Idiomas soportados | no disponible (la model card no publica lista de idiomas; hay una prueba cualitativa en chino tradicional) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M con `ssm_alpha`/`ssm_beta` en BF16); codificador de visión en GGUF BF16 (`mmproj`) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer con mezcla de expertos de la familia Qwen3.6, con 256 expertos por capa y enrutamiento top-8, según la model card del reempaquetado. Incorpora una capa MTP (multi-token prediction) que se conserva en el GGUF y que el motor Strata usa para decodificación especulativa con `--mtp 2`. También incluye un codificador de visión separado en formato `mmproj`, heredado sin cambios de SC117. El autor del reempaquetado no documenta el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento; esos datos corresponden al modelo original de InternScience y no se reproducen en esta ficha.

La innovación técnica relevante aquí no está en el entrenamiento sino en el empaquetado. Los tiers FIT de SC117 no cargan en el motor Strata porque este exige `ssm_alpha` y `ssm_beta` en F32/BF16/F16/Q8_0 y rechaza expertos enrutados en Q3_K. El autor recuantizó el BF16 abliterated con `llama-quantize` (llama.cpp b12202) usando una importance matrix, forzando `ssm_alpha.weight=bf16` y `ssm_beta.weight=bf16`, y verificó que los tipos de tensor resultantes coinciden tensor a tensor con el fichero de referencia de ykarout. El BF16 de entrada se validó contra el sha256 publicado por SC117 antes de cuantizar. No se modificaron pesos ni metadatos más allá de la cuantización.

## Capacidades

- Generación de texto conversacional multi-turno, con contexto declarado de hasta 262.144 tokens en la configuración de ejemplo.
- Razonamiento y generación de código: las pruebas de velocidad del autor usan tres prompts de código, lo que indica uso previsto en ese dominio.
- Decodificación especulativa mediante la capa MTP conservada, con aceptación de borradores del 70-78 % según el autor.
- Visión: el codificador `mmproj` permite describir imágenes; en la prueba publicada, una imagen de 640x400 con dos formas y el texto "STRATA 7419" se describió correctamente en unos 1,7 s para 290 tokens de imagen (encoder en CPU).
- Soporte multilingüe: no hay lista publicada; se incluye un prompt de prueba en chino tradicional, y el autor advierte que `--draft-vocab 16384` acelera el MTP en inglés y código pero ralentiza en otros sistemas de escritura.
- Sin guardarraíles integrados: la abliteración elimina la dirección de rechazo, por lo que el modelo puede cumplir peticiones dañinas, ilegales o inseguras.
- No se documenta soporte de tool calling, function calling ni uso como agente multi-paso en la información disponible.

## Casos de uso

- Sustitución directa en un stack Strata ya montado: cualquier usuario que tenga funcionando `ykarout/Strata-Sage-A1.5-GGUF` puede cambiar el fichero GGUF por este y conservar configuración, tokenizer y perfil de expertos, gracias a que el layout de tensores es idéntico tensor a tensor.
- Generación de código en local con contexto largo: con 262K tokens de ventana y un throughput medido de 129-152 tok/s en RTX 5080, es adecuado para tareas de refactorización sobre repositorios grandes o análisis de ficheros extensos en una sola pasada.
- Procesamiento de documentos con imagen y texto: el codificador de visión permite extraer información de capturas, diagramas o formularios escaneados; el encoder puede ejecutarse en CPU si la VRAM es escasa, a costa de latencia.
- Investigación sobre alineamiento y abliteración: el par base/abliterated (Sage-A1.5 frente a Sage-A1.5-abliterated) permite estudiar el efecto de la ablación de la dirección de rechazo con un KL macro reportado de 0,0114 por SC117, aunque esa cifra corresponde a los pesos BF16, no a este Q4_K_M.
- Experimentación con decodificación especulativa: la capa MTP y los parámetros `--mtp`, `--spec-min-p`, `--draft-vocab` y `--draft-ctx` permiten medir el impacto de la aceptación de borradores en distintos dominios e idiomas.
- Despliegue en hardware de consumo con requisitos controlados: 20,2 GiB de pesos más 861 MiB de visión caben en una GPU de 16 GB manteniendo 90 de 256 expertos por capa en VRAM, según la medición del autor, lo que habilita prototipos locales sin infraestructura de datacenter.
- Entornos de red teaming y pruebas de robustez: al no tener guardarraíles, sirve para evaluar la eficacia de capas de moderación externas, siempre con control de acceso y revisión legal propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (MMLU, HumanEval, GSM8K u otros). Las únicas métricas publicadas son de velocidad de decodificación, medidas en RTX 5080 de 16 GB, Ryzen 7 7700 (8 núcleos) y 32 GB de RAM, con contexto de 262K, KV en int8, MTP 2 y `--draft-vocab 16384`, sobre cuatro prompts fijos (tres de código, uno en chino tradicional), 384 tokens, temperatura 0,7, thinking desactivado y caché caliente:

| Modelo | Prompts de código | Prompt en chino |
|---|---|---|
| Sage Q4_K_M original de ykarout | 128-164 tok/s | 121 tok/s |
| Este fichero (abliterated Q4_K_M) | 129-152 tok/s | 116-124 tok/s |

Otros datos medidos: 90 de 256 expertos por capa en VRAM, aceptación de borradores MTP del 70-78 %, y visión con encoder en CPU describiendo correctamente una imagen de 640x400 en aproximadamente 1,7 s para 290 tokens de imagen. La variante IQ3_S por expertos (15,75 GiB) se descartó por decodificar más lento (87-94 tok/s frente a 129-152 tok/s). El autor declara explícitamente como no medidos: KL y perplejidad de esta cuantización frente al BF16, tasa de rechazo tras cuantizar, y comportamiento en contexto largo.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos Q4_K_M ocupan 20,2 GiB y el codificador de visión 861 MiB; con 90 de 256 expertos por capa en VRAM, el autor lo ejecuta en una GPU de 16 GB, lo que implica que parte de los expertos reside en RAM del sistema y se intercambia.
- Memoria del sistema: 32 GB de RAM en la máquina de prueba; con 20,2 GiB de pesos y contexto de 262K con KV en int8, se recomienda al menos esa cantidad, y más si se reduce el número de expertos en VRAM.
- GPU recomendadas: RTX 5080 de 16 GB es la única configuración medida. Por tamaño de pesos, una A100 de 40 GB o una H100 permitirían mantener más expertos en VRAM y reducir los intercambios, pero no hay mediciones publicadas en esas GPU.
- ¿Cabe en GPU de consumo? Sí, en una RTX 5080 de 16 GB con el esquema de expertos parcialmente en VRAM descrito; no hay datos para GPUs de 8 o 12 GB.
- Opciones de despliegue: el motor previsto es Strata, rama `q36-r2`, con binario `strata.exe` y el ejecutable auxiliar `strata-vision.exe` para el codificador visual. El tokenizer se genera con `python tools/strata_tokenizer.py --gguf <model>.gguf --out <dir>`. No se documenta compatibilidad con llama.cpp, Ollama, vLLM ni TGI para este fichero concreto; el formato GGUF es estándar, pero el layout específico de `ssm_alpha`/`ssm_beta` y la exigencia del motor Strata sugieren que otros runners no lo cargarán sin adaptación.
- Latencia y throughput: 129-152 tok/s en prompts de código y 116-124 tok/s en chino, con MTP 2 y aceptación de borradores del 70-78 %; visión en CPU a ~1,7 s por imagen de 290 tokens.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| Este fichero (Sage-A1.5-abliterated-Strata-GGUF) | 35,5 mil M totales, MoE top-8 sobre 256 expertos | 262.144 tokens (config. de ejemplo) | Q4_K_M, 20,2 GiB | Apache 2.0 | Hugging Face, 0 descargas | Sin guardarraíles; requiere motor Strata |
| ykarout/Strata-Sage-A1.5-GGUF | mismos parámetros (modelo base) | mismo contexto | Q4_K_M con `ssm_alpha`/`ssm_beta` BF16 | Apache 2.0 (según modelo base) | Hugging Face | Pesos originales con alineamiento intacto; 128-164 tok/s en código |
| SC117/Sage-A1.5-abliterated-MTP-FIT-GGUF | mismos parámetros | no disponible | tiers FIT (BF16 y cuantizaciones propias) | Apache 2.0 (según modelo base) | Hugging Face | Abliterated BF16 de origen; no carga en Strata sin recuantizar; rechazos 96/100 → 2/100 y KL macro 0,0114 reportados por SC117 |
| InternScience/Sage-A1.5 | 35,5 mil M totales, MoE top-8 sobre 256 expertos | no disponible en esta ficha | safetensors/BF16 (formato original) | Apache 2.0 | Hugging Face, arXiv 2610.28578 | Modelo original; referencia para comparar efectos de la abliteración |

## Limitaciones y advertencias

- Sin guardarraíles: la abliteración elimina la dirección de rechazo; el propio autor advierte que el modelo puede cumplir peticiones dañinas, ilegales o inseguras y que solo debe usarse con moderación, control de acceso y revisión legal propios.
- Riesgo de alucinación: no evaluado en la información disponible; no hay benchmarks de fidelidad ni de tasas de error factual.
- Idiomas: no se publica lista de idiomas soportados; el único dato cualitativo es una prueba en chino tradicional, y el autor señala que la optimización `--draft-vocab 16384` del MTP ralentiza la decodificación en sistemas de escritura distintos del latino.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base, el abliterated y este reempaquetado forman una cadena con posibles obligaciones de atribución; conviene revisar las condiciones de InternScience y de SC117 antes de producción.
- Compatibilidad restringida: el fichero está pensado para el motor Strata (`q36-r2`); no hay evidencia de que cargue en llama.cpp, Ollama, vLLM o TGI, y el layout específico de `ssm_alpha`/`ssm_beta` en BF16 es un requisito del motor, no una opción.
- Perfil de expertos no adaptado: el fichero `expert-profile-agent-v2.prof` se aprendió sobre el Sage original, no sobre el abliterated, por lo que la colocación inicial de expertos en VRAM puede no ser óptima para estos pesos.
- Métricas ausentes: no hay KL ni perplejidad de esta cuantización frente al BF16, ni tasa de rechazo tras cuantizar, ni evaluación en contexto largo; las cifras de SC117 (KL 0,0114, rechazos 2/100) corresponden a sus propios tiers, no a este fichero.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo día (9 de noviembre de 2026), sin validación comunitaria independiente.
- Contexto: los 262.144 tokens son la configuración de ejemplo del autor, no una especificación verificada del modelo; el rendimiento real en contextos muy largos no está medido.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/luis030/Sage-A1.5-abliterated-Strata-GGUF
- Modelo base original: https://huggingface.co/InternScience/Sage-A1.5
- Paper del modelo base: https://arxiv.org/abs/2610.28578
- Abliterated de origen (SC117): https://huggingface.co/SC117/Sage-A1.5-abliterated-MTP-FIT-GGUF
- Reempaquetado de referencia (ykarout): https://huggingface.co/ykarout/Strata-Sage-A1.5-GGUF
- Motor Strata, rama `q36-r2`: https://github.com/xyehya/Strata/tree/q36-r2
- Motor Strata (Niko1221): https://github.com/Niko1221/Strata
- llama.cpp: https://github.com/ggml-org/llama.cpp
