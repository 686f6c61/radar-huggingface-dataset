# mradermacher/BASE-1.5B-GGUF

## Resumen

BASE-1.5B-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo Stray2024/BASE-1.5B, realizadas por el usuario mradermacher, un colaborador conocido en la comunidad de Hugging Face por cuantizar masivamente modelos de terceros. El modelo base es un LLM de 1.543.714.304 parámetros (aproximadamente 1,54 B) orientado a generación de texto con capacidades de razonamiento (tags "reasoning" y "think"), entrenado mediante SFT y etiquetado como "companion" y "base". Soporta ruso e inglés.

La relevancia de esta ficha no reside en el modelo en sí, sino en la utilidad práctica de las cuantizaciones: al tratarse de un modelo pequeño, las versiones cuantizadas (desde 0,8 GB en Q2_K hasta 3,2 GB en f16) permiten ejecutarlo en hardware muy modesto, incluidas CPUs y portátiles sin GPU dedicada, mediante llama.cpp, Ollama o herramientas compatibles con GGUF. Es un candidato típico para asistentes locales ligeros, chatbots de compañía y experimentación con modelos de razonamiento en dispositivos de gama baja.

No se dispone de información detallada sobre la arquitectura exacta, los datos de entrenamiento ni los benchmarks del modelo base; la model card de la cuantización se limita a enlazar al repositorio original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer, presumiblemente, no confirmado) |
| Parametros totales | 1.543.714.304 (~1,54 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ruso (ru), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base usa safetensors |

## Arquitectura y entrenamiento

La informacion disponible sobre la arquitectura del modelo base Stray2024/BASE-1.5B es escasa. Los tags de la model card indican que se trata de un modelo entrenado con SFT (supervised fine-tuning) usando la libreria Unsloth, orientado a razonamiento ("reasoning", "think") y a uso conversacional tipo companero ("companion", "conversational"). El tamano de ~1,5 B parametros sugiere una arquitectura transformer decoder-only compacta, similar en escala a modelos como Qwen2.5-1.5B, aunque esto ultimo no esta confirmado en la documentacion disponible.

No se ha publicado informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas de alineacion posteriores (RLHF, DPO). Tampoco constan innovaciones tecnicas especificas. En cuanto a la cuantizacion, mradermacher提供 cuantizaciones estaticas k-quant de llama.cpp convertidas desde los pesos safetensors del modelo base; no hay cuantizaciones imatrix ponderadas disponibles en el momento de redaccion de la ficha.

## Capacidades

- Generacion de texto conversacional en ruso e ingles, con enfoque de companero/companion segun los tags del autor.
- Razonamiento paso a paso: los tags "reasoning" y "think" indican que el modelo esta afinado para producir cadenas de razonamiento (estilo thinking) antes de responder.
- Uso como modelo base ligero para experimentacion local en formato GGUF.
- No hay informacion sobre capacidades de vision, audio ni multimodalidad; el pipeline es text-generation.
- No consta soporte oficial de tool calling ni function calling en la informacion disponible.
- No consta soporte de agentes ni multi-step reasoning estructurado mas alla del tag genérico de razonamiento.

## Casos de uso

- Chatbot de compania local: el tag "companion" y el tamano de 1,5 B lo hacen adecuado para asistentes conversacionales personales que corren enteramente en el dispositivo, sin enviar datos a la nube.
- Experimentacion con modelos de razonamiento en hardware modesto: con la version Q4_K_M (1,1 GB) se puede ejecutar en portatiles con 8 GB de RAM para estudiar el comportamiento de cadenas de razonamiento.
- Asistente de escritura bilingue ruso-ingles: util para redaccion y revision de textos en estos dos idiomas en entornos offline.
- Integracion en aplicaciones moviles o de escritorio via llama.cpp: el formato GGUF y el tamano reducido permiten despliegues embebidos con latencias bajas en CPU.
- Prototipado rapido de agentes ligeros: su bajo consumo de recursos permite iterar pipelines conversacionales multi-turno sin coste de GPU.
- Fine-tuning posterior de bajo coste: al ser un modelo base/afinado pequeño con licencia Apache 2.0, es viable realizar SFT adicional en una sola GPU de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: desde ~0,8 GB (Q2_K) hasta ~3,2 GB (f16). La version recomendada Q4_K_M ocupa ~1,1 GB; con contexto y overhead, basta con 2-4 GB de RAM/VRAM.
- GPU recomendadas: no requiere GPU; cualquier GPU moderna con 4 GB de VRAM (por ejemplo GTX 1650, RTX 3050 o superiores) lo ejecuta con holgura. En CPU, cualquier procesador de los ultimos anos es suficiente dado el tamano.
- Consumer GPUs: cabe sobradamente en practicamente cualquier GPU de consumo actual, incluso en las de entrada.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, KoboldCpp, y cualquier runtime compatible con GGUF. El modelo base safetensors puede desplegarse con transformers o vLLM.
- Latencia y throughput: no disponibles; por tamano y cuantizacion, se esperan velocidades de decodificacion elevadas incluso en CPU (decenas de tokens/segundo en hardware moderno), aunque no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| BASE-1.5B (este) | ~1,54 B | no disponible | Apache 2.0 | SFT con Unsloth, razonamiento, ru/en, GGUF |
| Qwen2.5-1.5B-Instruct | 1,5 B | 32k (128k con YaRN) | Qwen license (uso comercial permitido con condiciones) | Multilingue amplio, tool calling, benchmarks publicados |
| Llama-3.2-1B-Instruct | 1,24 B | 128k | Llama 3.2 Community License | Multilingue (8 idiomas), ecosistema amplio |
| SmolLM2-1.7B-Instruct | 1,7 B | 8k | Apache 2.0 | Entrenado por Hugging Face, buen rendimiento en tareas generales |

Nota: la comparativa se ofrece a titulo orientativo; para BASE-1.5B no hay benchmarks publicados que permitan comparar rendimiento cuantitativo.

## Limitaciones y advertencias

- No hay benchmarks publicados: la calidad real del modelo base no puede verificarse con datos objetivos; conviene evaluarlo antes de uso serio.
- Alcance linguistico limitado a ruso e ingles; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea inferior.
- La longitud de contexto no esta documentada, lo que dificulta planificar aplicaciones con documentos largos.
- Cuantizaciones agresivas (Q2_K, Q3_K_S/M) degradan notablemente la calidad, especialmente en razonamiento; se recomiendan Q4_K_M o superiores.
- No hay cuantizaciones imatrix disponibles, por lo que las versiones estaticas pueden perder algo de calidad respecto a cuants ponderados.
- Al ser un modelo de companero/conversacional afinado con SFT, puede presentar alucinaciones habituales de modelos pequenos y no esta indicado para tareas que exijan factualidad estricta.
- Licencia Apache 2.0: sin restricciones para uso comercial, pero no hay garantias de rendimiento ni soporte.
- Proyecto de un autor individual (Stray2024) sin documentacion extensa; el riesgo de abandono o falta de mantenimiento es mayor que en modelos de laboratorios establecidos.

## Enlaces

- Modelo cuantizado (GGUF): https://huggingface.co/mradermacher/BASE-1.5B-GGUF
- Modelo base: https://huggingface.co/Stray2024/BASE-1.5B
- Pagina de descargas resumida: https://hf.tst.eu/model#BASE-1.5B-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Empresa del cuantizador: https://www.nethype.de/
- Notas sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
