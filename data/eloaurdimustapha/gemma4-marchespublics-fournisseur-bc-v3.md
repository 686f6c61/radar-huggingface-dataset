# EloaurdiMustapha/gemma4-marchespublics-fournisseur-bc-v3

## Resumen

EloaurdiMustapha/gemma4-marchespublics-fournisseur-bc-v3 es un ajuste fino del modelo Gemma 4, distribuido exclusivamente en formato GGUF y orientado a tareas de asistencia en el ambito de los mercados publicos (marchés publics) desde la perspectiva del proveedor o licitador. El autor es EloaurdiMustapha y el repositorio se publica en HuggingFace con fecha de creacion del 28 de septiembre de 2026. El nombre del identificador interno de los ficheros (gemma-4-e4b-it) indica que la base empleada es la variante instruct de Gemma 4 con denominacion E4B de Google, y que el ajuste se ha especializado en la terminologia y los flujos documentales de la contratacion publica.

El modelo es multimodal (vision-language model): incorpora un proyector visual (`mmproj`) que permite procesar imagenes, ademas de texto, lo que resulta coherente con el tipo de documentos que maneja el dominio objetivo (pliegos escaneados, tablas, formularios y anexos en PDF). Se distribuye en dos ficheros GGUF: uno con el proyector visual en BF16 y otro con los pesos del modelo cuantizados en Q4_K_M.

El dato de parametros reportado en metadatos de safetensors asciende a 7.518.069.290 parametros totales (aproximadamente 7,5 mil millones), sobre un repositorio de 6,3 GB. La relevancia actual del modelo es limitada por su escasa traccion publica (cero descargas y cero "likes" en el momento de la ficha) y por la ausencia de informacion sobre licencia, idiomas o dataset de entrenamiento, lo que obliga a tratarlo como un experimento de ajuste fino mas que como un artefacto listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language), derivada de Gemma 4; con proyector visual (`mmproj`) |
| Parametros totales | 7.518.069.290 (~7,5 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (solo el proyector `mmproj`), Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (compatible con llama.cpp) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base Gemma 4 E4B IT ni sobre su proceso de entrenamiento original. Los ficheros publicados corresponden a una conversion a GGUF realizada con la herramienta Unsloth, y a un ajuste fino posterior del checkpoint instruct de Gemma 4. La presencia del fichero `gemma-4-e4b-it.BF16-mmproj.gguf` confirma que el modelo conserva la torre de vision y que esta se ha exportado en BF16 para preservar la calidad del proyector multimodal, mientras que el cuerpo principal del modelo se ofrece en Q4_K_M.

En cuanto a los datos de ajuste, la informacion disponible no especifica el numero de tokens, la composicion del dataset ni si se emplearon tecnicas de RLHF, DPO o SFT. El nombre del repositorio (`marchespublics-fournisseur-bc-v3`) sugiere un ajuste supervisado sobre corpus de mercados publicos orientado al rol de proveedor, probablemente procedente de fuentes del portal marroqui marchespublics.gov.ma, pero esto es una inferencia a partir del identificador y no un dato documentado. Existe un repositorio hermano (`gemma4-marchespublics-sft2`) que apunta a una linea de trabajo por fases de SFT.

## Capacidades

- Generacion de texto conversacional en formato instruct (etiqueta `conversational`).
- Comprension multimodal: procesamiento de imagenes y documentos escaneados gracias al fichero `mmproj` y al binario `llama-mtmd-cli`.
- Ajuste de dominio orientado a contratacion publica desde el lado del proveedor (terminologia de pliegos, licitaciones y requisitos administrativos).
- Compatibilidad con endpoints (`endpoints_compatible`) y con el ecosistema llama.cpp.
- Compatibilidad con plantillas de chat mediante `--jinja`.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no disponible (no documentado para este ajuste).
- Modo de razonamiento explicito (thinking mode) o audio: no disponible.

## Casos de uso

- Asistencia a licitadores en mercados publicos: el modelo puede responder consultas sobre requisitos de un pliego concreto, plazos y documentacion exigida, aprovechando su ajuste de dominio sobre terminologia de contratacion publica.
- Analisis de pliegos escaneados: al ser multimodal, puede procesar imagenes de paginas de un pliego en PDF y extraer informacion relevante (importes, criterios de adjudicacion, garantias) sin necesidad de OCR externo.
- Redaccion asistida de ofertas: generacion de borradores de memorias tecnicas y declaraciones responsables a partir de la informacion del pliego, usando la plantilla de chat instruct.
- Clasificacion y triaje de convocatorias: dado un conjunto de documentos de licitacion, el modelo puede resumirlos y clasificarlos por relevancia para el perfil de un proveedor concreto.
- Atencion en ventanilla unica del proveedor: conversaciones multi-turno con un operador humano o ciudadano sobre el estado de una licitacion, siempre que la ventana de contexto resultante sea suficiente (no documentada).
- Extraccion estructurada de datos de formularios: al combinar vision y texto, el modelo puede transcribir campos de formularios administrativos escaneados a un formato semiestructurado.
- Despliegue local en puesto de trabajo: al distribuirse en GGUF Q4_K_M, puede ejecutarse en un portatil con GPU consumer para tareas de asistencia sin enviar documentos sensibles a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 5-6 GB para el fichero Q4_K_M (modelo de ~7,5 mil millones de parametros cuantizado a 4 bits) mas aproximadamente 1-1,5 GB adicionales para el proyector `mmproj` en BF16 cuando se usa el modo multimodal.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM para el modo texto; 12 GB o mas para el modo multimodal con contexto amplio. Cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090. En el rango profesional, A100, H100, L40S o A10G ofrecen margen de sobra.
- Cabe en GPU consumer: si, siempre que disponga de al menos 8-12 GB de VRAM. En GPUs de 6 GB el modo multimodal puede requerir descarga parcial a RAM.
- Opciones de despliegue: llama.cpp (`llama-cli` para texto y `llama-mtmd-cli` para multimodal), Ollama, LM Studio y servidores compatibles con endpoints de llama.cpp. No hay soporte confirmado para vLLM, TGI o TensorRT-LLM dado el formato GGUF.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma4-marchespublics-fournisseur-bc-v3 | ~7,5 mil millones | no disponible | GGUF (Q4_K_M, BF16 mmproj) | no disponible | HuggingFace, 0 descargas |
| Gemma 4 E4B IT (base) | no disponible | no disponible | safetensors / GGUF | licencia Gemma (no confirmada para este check) | Google DeepMind / Google AI for Developers |
| EloaurdiMustapha/gemma4-marchespublics-sft2 | no disponible | no disponible | GGUF | no disponible | HuggingFace |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada, por lo que la comparacion se limita a parametros, formato y disponibilidad.

## Limitaciones y advertencias

- Riesgo de alucinacion en dominio juridico y administrativo: el modelo puede inventar plazos, articulos o requisitos legales, algo especialmente peligroso en un contexto de licitaciones publicas.
- Ausencia de licencia declarada: no se especifica la licencia del ajuste ni si hereda la de Gemma 4; no se debe asumir uso comercial permitido sin verificacion previa.
- Sin informacion sobre idiomas soportados: aunque la base Gemma es multilingue, no se documenta si el ajuste conserva esa capacidad ni en que idiomas se entreno (el nombre sugiere frances y posiblemente arabe, pero no esta confirmado).
- Ventana de contexto no documentada: limita el diseno de aplicaciones con documentos largos.
- Repositorio sin validacion de la comunidad: cero descargas y cero "likes" implican ausencia de revision externa sobre calidad, sesgos o seguridad.
- Riesgo de degradacion de capacidades generales: un ajuste fino de dominio puede reducir el rendimiento en tareas fuera del ambito de contratacion publica.
- Sesgos potenciales derivados del corpus de entrenamiento (fuente administrativa concreta) no evaluados ni documentados.
- Fichero `mmproj` en BF16: encarece ligeramente el despliegue multimodal respecto a un proyector cuantizado.
- No se documentan mecanicas de tool calling ni de agentes, por lo que no debe asumirse soporte nativo para pipelines de CI/CD o automatizaciones complejas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/EloaurdiMustapha/gemma4-marchespublics-fournisseur-bc-v3
- Repositorio hermano (SFT): https://huggingface.co/EloaurdiMustapha/gemma4-marchespublics-sft2
- Unsloth: https://github.com/unslothai/unsloth
- Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Documentacion de Gemma en Google AI for Developers: https://ai.google.dev/gemma/docs/core
- Gemma 4 en Ollama: https://ollama.com/library/gemma4:latest
- Portal de mercados publicos de Marruecos: https://www.marchespublics.gov.ma/?lang=fr
