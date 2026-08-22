# jcbtc/Qwen3.8-27B-IU4-Kairic-Edge

## Resumen

Kairic Edge es una cuantización IU4 (4 bits de pesos y activaciones) del modelo Qwen3.8-27B de Alibaba, publicada por Kairic.ai (autor jcbtc) y orientada a hardware AMD Strix Halo con GPU integrada Radeon 8060S (gfx1151). La principal aportación es el uso de la instrucción nativa de AMD RDNA 3.5 `V_WMMA_I32_16X16X16_IU4`, que permite ejecutar operaciones de matriz con activaciones y pesos cuantizados a 4 bits sin expandirlos a mayor precisión, lo que se traduce en un aumento de rendimiento de hasta 1.94× respecto a FP16 y 1.93× respecto a IU8 en el mismo dispositivo.

El modelo se presenta como un GGUF autoritativo de 15.48 GiB junto con tres archivos `.pfs` adicionales (10.57 GiB) que implementan la arquitectura "Dual View": una vista compacta para operaciones sensibles a la calidad y una vista acelerada para operaciones de feed-forward y proyección. El runtime requiere una compilación específica de llama.cpp (la rama `kairic-edge-qwen38-27b-v1` del repositorio ROCmFPX) y activa por defecto el caché de prompts, la configuración de contexto 256K y el MTP (multi-token prediction) nativo.

La relevancia de este modelo radica en que demuestra una integración profunda entre el software de inferencia y las instrucciones de bajo nivel de la GPU AMD, logrando un rendimiento de generación de 47.73 tokens/s en una suite de código de 164 tareas, un 85% superior al de cuantizaciones dinámicas Q4 estándar. Es un ejemplo de optimización vertical para un hardware específico, más que un modelo generalista.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3.8-27B: transformer híbrido con 16 capas de atención completa y 48 capas de atención lineal con estado recurrente |
| Parámetros totales | 27.320.697.856 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 256K tokens (configuración cualificada del runtime Kairic Edge); el modelo base soporta 262K extensible a 1M |
| Tipos de cuantización | IU4 (w4a4) con GGUF; también se mencionan variantes Q4 y Q6 de comparación |
| Idiomas soportados | No disponible en la model card; el modelo base Qwen3.8-27B soporta múltiples idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (autoritativo) + sidecars `.pfs` para ejecución acelerada |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27.8 mil millones de parámetros (el repositorio reporta 27.320.697.856 parámetros para esta cuantización) con una arquitectura híbrida de atención: solo 16 de sus 64 capas usan atención completa (con intervalo de atención completa de 4), mientras que las restantes 48 capas emplean atención lineal con un estado recurrente constante. Esta mezcla reduce el coste computacional y de memoria en contextos largos, manteniendo la capacidad de razonamiento.

La cuantización Kairic Edge no es un reentrenamiento, sino una compresión post-entrenamiento que aprovecha la instrucción `VWMMA_I32_16X16X16_IU4` de la arquitectura RDNA 3.5. Esta instrucción ejecuta multiplicaciones de matrices con activaciones sin signo de 4 bits y pesos con signo de 4 bits, con acumulación en enteros de 32 bits y reconstrucción de escala y cero. El runtime Kairic Edge enruta solo las operaciones que cumplen los requisitos de forma y precisión a esta vía acelerada, y falla de forma segura a la ruta autoritativa (GGUF) para el resto. No se dispone de información sobre el dataset de entrenamiento del modelo base, pero el modelo se ha evaluado con un harness adaptado a HumanEval y HumanEval Plus.

## Capacidades

- Generación de texto y código en un contexto de hasta 256K tokens (configuración soportada por el runtime).
- Razonamiento matemático y lógico, con soporte para tareas de código complejas (HumanEval Base y Plus).
- Multi-token prediction (MTP) nativo con 4 tokens simultáneos, que acelera la decodificación.
- Soporte de visión en el modelo base (entrada de imágenes y vídeo), aunque esta cuantización se centra en texto.
- Compatible con el ecosistema llama.cpp, aunque requiere el runtime personalizado para activar las optimizaciones.
- No se especifica soporte de tool calling o function calling en la documentación de la cuantización.

## Casos de uso

- Desarrollo de código asistido en equipos con AMD Strix Halo: el modelo ofrece una velocidad de generación de código superior a las cuantizaciones estándar, lo que permite un autocompletado y una generación de funciones más fluida en un portátil o mini PC con GPU integrada de 32 GiB.
- Servidor de inferencia local de baja latencia: gracias a la ruta IU4 nativa y al MTP, puede servir respuestas en tiempo real en aplicaciones de chat o agentes sin depender de la nube, con un rendimiento de 47.73 tokens/s de media y picos de 106.68 tokens/s.
- Análisis de documentos de gran tamaño: la ventana de 256K tokens permite procesar libros técnicos, informes de investigación o código fuente de repositorios extensos en una sola pasada, sin necesidad de fragmentación.
- Evaluación de modelos en entornos con restricciones de VRAM: al ocupar 15.48 GiB el GGUF (más 10.57 GiB de los sidecars opcionales), cabe en GPUs con 24 GiB de VRAM, aunque el rendimiento óptimo requiere hardware con soporte de la instrucción IU4.
- Generación de pruebas unitarias y depuración en pipelines de CI/CD: su capacidad para completar código y razonar sobre errores puede integrarse en herramientas de calidad de software, aunque no se documenta explícitamente soporte de function calling.
- Prototipado de aplicaciones de IA en hardware AMD: permite a desarrolladores evaluar el rendimiento de modelos grandes en plataformas AMD sin necesidad de GPUs NVIDIA, gracias al uso de ROCm y las instrucciones nativas.

## Benchmarks y rendimiento

La model card incluye una evaluación de 164 tareas adaptadas de HumanEval/EvalPlus, ejecutadas en un AMD Ryzen AI Max+ 395 con Radeon 8060S, con un solo slot, F16 target/draft KV, batch 2048, ubatch 512, 16 target threads, 32 batch threads, MTP4 y muestreo determinista.

| Métrica | Kairic Edge IU4 | Unsloth Dynamic Q4 | Unsloth Dynamic Q6 |
|---|---|---|---|
| HumanEval Base (aciertos/164) | 158 (96.34%) | 158 (96.34%) | 157 (95.73%) |
| HumanEval Plus (aciertos/164) | 152 (92.68%) | 148 (90.24%) | 150 (91.46%) |
| Prompt processing agregado (tok/s) | 358.45 | 314.14 | 260.29 |
| Generación agregada (tok/s) | 47.73 | 25.80 | 25.31 |
| Pico de generación (tok/s) | 106.68 | 30.00 | 27.99 |
| Tiempo total de generación (s) | 950.45 | 1,778.27 | 1,732.38 |

La comparación relativa indica un aumento del 85.03% en la generación agregada frente a Q4, una reducción del 46.55% en el tiempo de generación y un factor de 3.56× en el pico de generación. Además, el harness de instrucciones IU4 alcanzó 104.66 TOPS, un 1.94× frente a FP16 y 1.93× frente a IU8 en el mismo dispositivo. No se han publicado resultados de benchmarks más amplios (MMLU, GSM8K, etc.) para esta cuantización específica.

## Requisitos de hardware

- VRAM estimada: el GGUF principal ocupa 15.48 GiB; los sidecars `.pfs` añaden 10.57 GiB. El total es de 26.05 GiB, por lo que se necesita al menos una GPU con 32 GiB de VRAM para ejecutar el modelo completo con los sidecars. En configuraciones sin sidecars (solo GGUF) cabría en 24 GiB.
- GPU recomendada: AMD Radeon 8060S (gfx1151) con arquitectura RDNA 3.5, para aprovechar la instrucción IU4 nativa. En otras GPUs AMD o NVIDIA, el modelo puede ejecutarse con llama.cpp estándar, pero sin las ganancias de rendimiento del runtime Kairic Edge.
- Hardware adicional: el modelo está optimizado para el AMD Ryzen AI Max+ 395 (Strix Halo) con iGPU de 32 GiB.
- Opciones de despliegue: llama.cpp con el runtime personalizado de Kairic Edge (repositorio ROCmFPX, rama `kairic-edge-qwen38-27b-v1`). No es compatible con vLLM ni TGI de forma directa.
- Latencia y throughput: la generación agregada es de 47.73 tokens/s, con picos de 106.68 tokens/s en la suite de código; el prompt processing alcanza 358.45 tokens/s. El prompt cache reduce el tiempo de prompts repetidos en un 98.39–99.87% para longitudes de 2K a 32K tokens.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Rendimiento HumanEval (Base) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-IU4-Kairic-Edge | 27.32 B | 32K (config) | IU4 (w4a4) | 158/164 | Apache 2.0 | GGUF + sidecars |
| Qwen3.8-27B (Unsloth Dynamic Q4) | 27.32 B | 32K | Q4 (4-bit) | 158/164 | Apache 2.0 | GGUF estándar |
| Qwen3.8-27B (Unsloth Dynamic Q6) | 27.32 B | 32K | Q6 (6-bit) | 157/164 | Apache 2.0 | GGUF estándar |
| Llama 3.3 27B (Q4) | 27 B | 128K | Q4 | ~90 (estimado) | Llama 3.3 Community | GGUF |

La comparación directa con las cuantizaciones de Unsloth muestra que Kairic Edge mantiene la misma puntuación en Base y mejora en Plus, con un rendimiento de generación muy superior gracias al uso de la instrucción IU4 y el MTP. No se dispone de datos de otros modelos de 27B en la información proporcionada.

## Limitaciones y advertencias

- El modelo requiere un runtime personalizado de llama.cpp (la rama `kairic-edge-qwen38-27b-v1` de ROCmFPX) y no es compatible con la compilación estándar; el uso de la ruta acelerada IU4 solo está disponible en hardware AMD con RDNA 3.5.
- Los sidecars `.pfs` añaden un coste de memoria de 10.57 GiB, lo que eleva el requisito total a más de 26 GiB; en GPUs de 24 GiB solo se puede cargar el GGUF principal, perdiendo las ventajas de Prompt Forge.
- La documentación no especifica los idiomas soportados; aunque el modelo base es multilingüe, esta cuantización no ofrece garantías de cobertura idiomática.
- No se han publicado resultados de benchmarks generales (MMLU, GSM8K, etc.), solo de código; su rendimiento en otras tareas no está validado.
- El modelo base es multimodal (acepta imágenes y vídeo), pero la cuantización se ha enfocado en generación de texto; no se garantiza el funcionamiento de la parte visual.
- Riesgo de alucinación inherente a los modelos de lenguaje; se recomienda validar el código generado en entornos de producción.
- La licencia Apache 2.0 permite uso comercial y modificación, pero el runtime propietario de Kairic.ai puede tener restricciones adicionales (no especificadas).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jcbtc/Qwen3.8-27B-IU4-Kairic-Edge
- Repositorio del runtime Kairic Edge: https://github.com/ciru-ai/ROCmFPX/tree/kairic-edge-qwen38-27b-v1
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Página de vLLM Recipes con arquitectura del modelo base: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Análisis técnico de Qwen3.8-27B (Local AI Zone): https://local-ai-zone.github.io/blog/qwen3-8-27b-comprehensive-analysis.html
- Especificaciones y benchmarks del modelo base (AI/TLDR): https://ai-tldr.dev/models/qwen3-8-27b/
