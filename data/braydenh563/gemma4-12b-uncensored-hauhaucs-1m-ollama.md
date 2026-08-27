# braydenh563/Gemma4-12B-Uncensored-HauhauCS-1M-Ollama

## Resumen

El modelo `braydenh563/Gemma4-12B-Uncensored-HauhauCS-1M-Ollama` es una conversión a GGUF del checkpoint `HauhauCS/Gemma4-12B-QAT-Uncensored-HauhauCS-Balanced`, un Gemma 4 de 12B parámetros sin censura (uncensored) y con una ventana de contexto ampliada a 1.048.576 tokens mediante la técnica YaRN. El autor, braydenh563, lo publica en formato Ollama/llama.cpp para facilitar su uso en entornos locales y de producción ligera. Incluye capacidades multimodales (visión) y soporte para decodificación especulativa (MTP), lo que lo hace relevante para tareas de razonamiento de contexto largo y generación asistida por imágenes.

Este modelo se posiciona como una alternativa sin restricciones de seguridad para desarrolladores que necesitan respuestas directas en dominios como investigación, análisis técnico o generación creativa, aunque su licencia Gemma impone ciertas restricciones de uso comercial. Al estar cuantizado en GGUF, puede ejecutarse en GPUs de consumo con 32 GB de VRAM, como se ha demostrado en certificaciones de contexto completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 (transformer multimodal con visión) |
| Parametros totales | 12B (aproximado, no confirmado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.048.576 tokens (1M, ampliado con YaRN) |
| Tipos de cuantizacion | GGUF (variantes Q4_K_M, Q5_K_M, Q8_0, etc., no listadas) |
| Idiomas soportados | no disponible (probablemente multilingüe, sin confirmar) |
| Licencia | Gemma (según tag `license:gemma`) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un Gemma 4 de 12B parámetros, desarrollado por Google, con arquitectura transformer multimodal que procesa texto e imágenes. El checkpoint original de HauhauCS aplica una técnica de "abliteración" (abliteration) para eliminar los mecanismos de rechazo de contenido, resultando en un modelo sin censura. El autor de este repositorio lo convierte a GGUF y le aplica una extensión de contexto mediante YaRN (Yet another RoPE extensioN) con factor 6, alcanzando 1.048.576 tokens. No se dispone de detalles sobre el dataset de entrenamiento, el número de tokens o si se usó RLHF/DPO, más allá de la modificación de abliteración. El modelo incluye soporte para decodificación especulativa (MTP, multi-token prediction) y está optimizado para su uso con llama.cpp y Ollama.

## Capacidades

- Generación de texto sin censura: responde a solicitudes que otros modelos rechazarían, incluyendo contenido controvertido o explícito.
- Razonamiento de contexto largo: maneja ventanas de hasta 1M tokens, útil para documentos extensos, libros o análisis de código completo.
- Visión: procesa imágenes como entrada (multimodal), aunque no se especifican detalles de resolución o formatos.
- Decodificación especulativa: acelera la inferencia mediante predicción de múltiples tokens (MTP).
- Soporte para tool calling y function calling: no confirmado explícitamente, pero probable dado el ecosistema Gemma 4.
- Multilingüe: no confirmado, pero los modelos Gemma 4 suelen soportar varios idiomas.

## Casos de uso

- Análisis de documentos extensos: procesar contratos, tesis o informes de más de 500 páginas en una sola pasada gracias a la ventana de 1M tokens, resumiendo y extrayendo información clave sin perder contexto.
- Generación de código en repositorios completos: revisar y refactorizar proyectos enteros cargando el árbol de archivos en el contexto, con soporte para decodificación especulativa que reduce la latencia en iteraciones de desarrollo.
- Investigación académica sin restricciones: explorar hipótesis controvertidas o temas tabú en ciencias sociales, donde los modelos censurados limitan el análisis.
- Asistente creativo para narrativa adulta: generar ficción con contenido explícito o temas oscuros, aprovechando la ausencia de filtros de seguridad.
- Análisis de imágenes médicas o técnicas: combinar entrada visual con razonamiento de texto largo para describir y diagnosticar imágenes complejas en un contexto amplio.
- Automatización de atención al cliente en dominios sensibles: gestionar consultas sobre temas delicados (salud mental, adicciones) sin respuestas evasivas, manteniendo un historial de conversación de largo plazo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni pruebas de rendimiento específicas para este modelo. La única referencia es la certificación de "needle-perfect" a 1M tokens mencionada en modelos similares de la misma familia, pero no se confirma para este repositorio concreto.

## Requisitos de hardware

- VRAM estimada: para 12B en GGUF Q4_K_M, se requieren aproximadamente 8-10 GB de VRAM para inferencia estándar; con contexto de 1M tokens, la memoria necesaria crece significativamente (se ha demostrado ejecución en una RTX 5090 de 32 GB para certificación completa).
- GPU recomendadas: RTX 4090 (24 GB) o superior para contexto completo; GPUs con 16 GB pueden manejar contextos reducidos (128K-256K).
- Compatibilidad con consumer GPU: sí, en cuantizaciones bajas (Q4_K_M) y con contexto limitado; para 1M tokens se necesita al menos 32 GB.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con adaptación), TGI (si soporta GGUF), o servidores locales.
- Latencia y throughput: no disponibles; la decodificación especulativa (MTP) puede mejorar la velocidad, pero no hay cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| braydenh563/Gemma4-12B-Uncensored-HauhauCS-1M-Ollama | 12B | 1M | Gemma | GGUF | Uncensored, visión, MTP |
| satgeze/gemma4-12b-uncensored-1m | 12B | 1M | Gemma | GGUF | Certificado needle-perfect, visión |
| satgeze/gemma4-12b-uncensored-1.5m | 12B | 1.5M | Gemma | GGUF | YaRN factor 6, contexto extendido |
| braydenh563/Gemma-4-E2B-Uncensored-HauhauCS-Aggressive | 2B (E2B) | no disponible | Gemma | GGUF | Multimodal, audio, abliterado |

Los datos de la tabla se basan en los nombres y descripciones de los repositorios; no hay benchmarks comparativos publicados.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo sin censura, puede generar contenido ofensivo, discriminatorio o dañino; no se han mitigado sesgos de género, raza o religión.
- Riesgo de alucinación: alto, especialmente en contextos largos donde la coherencia puede degradarse; se recomienda verificación de hechos.
- Limitaciones de contexto: aunque soporta 1M tokens, la calidad de atención puede degradarse más allá de 128K-256K sin ajustes finos; la memoria requerida es elevada.
- Restricciones de licencia: la licencia Gemma permite uso comercial pero con restricciones (prohibido uso para armas, vigilancia masiva, etc.); el modelo "uncensored" puede violar los términos de uso de Google si se usa para contenido ilegal.
- Caveat de producción: no se recomienda para aplicaciones donde la seguridad del contenido sea crítica (atención al cliente pública, moderación) sin un sistema de filtrado posterior.
- Falta de documentación: no hay información sobre el proceso de abliteración, datos de entrenamiento o evaluación de seguridad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/braydenh563/Gemma4-12B-Uncensored-HauhauCS-1M-Ollama
- Modelo base (HauhauCS): https://huggingface.co/HauhauCS/Gemma4-12B-QAT-Uncensored-HauhauCS-Balanced
- Modelo similar con contexto 1.5M: https://ollama.com/satgeze/gemma4-12b-uncensored-1.5m
- Modelo similar con contexto 1M: https://ollama.com/satgeze/gemma4-12b-uncensored-1m
- README del modelo base (GitHub): https://github.com/hjhhoni/class_AI_deploy_and_apply/blob/master/model/gemma-4-12b-uncensored/README.md
