# DICPlay/RusMind-Zernyshko-1.6-GGUF

## Resumen

RusMind Zernyshko 1.6 es un modelo de lenguaje de escala muy reducida (83 millones de parametros) desarrollado por DICPlay y entrenado completamente desde cero sobre un corpus propio en ruso, con un tokenizador BPE propio de 16.000 tokens. Forma parte de la familia RusMind, presentada por el autor como un proyecto de "IA nacional" rusa, y su nombre ("Zernyshko", diminutivo de "grano" o "semilla") alude a su tamano minimo dentro de la familia. La version publicada en este repositorio es la cuantizacion GGUF en F16, pensada para ejecucion local en hardware extremadamente modesto mediante llama.cpp, LM Studio u Ollama.

El modelo resuelve un nicho muy concreto: generacion de texto conversacional en ruso con un sesgo explicito hacia cultura, folclore y especificidades rusas, con un coste computacional practicamente nulo (unos 167 MB de pesos). Su relevancia no esta en la capacidad general, que es muy limitada por el numero de parametros y la ventana de contexto de 1024 tokens, sino en su rendimiento relativo en pruebas de conocimiento cultural ruso: el autor reporta un MERA 2.0 de 0,049, identico al de SmolLM-3B pese a ser 36 veces mas pequeno, y resultados superiores a modelos de 4B a 10B en subconjuntos como RUBIN (refranes y sabiduria popular), LIMUR y Characters.

La ficha se basa exclusivamente en la model card del autor y en los metadatos del repositorio de Hugging Face. No se dispone de informacion sobre la composicion exacta del dataset de entrenamiento, el numero de tokens vistos ni los detalles del proceso de alineacion, por lo que esos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (10 capas, dimension 768); detalles de atencion no disponibles |
| Parametros totales | 83.083.008 (83 M) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | F16 (unico archivo publicado en este repo); safetensors en el repo base |
| Idiomas soportados | Ruso (ru) |
| Licencia | RusMind License (DICPlay); licencia "other" en Hugging Face |
| Formato de pesos | GGUF (F16, ~167 MB); safetensors en el repositorio base DICPlay/RusMind-Zernyshko-1.6 |
| Tokenizador | BPE propio, 16.000 tokens |
| Formato de chat | ChatML |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

La model card describe un transformer decoder-only de 10 capas y 768 dimensiones ocultas, con 83 millones de parametros, entrenado "completamente desde cero" sobre un corpus ruso propio y con un tokenizador BPE propio de 16.000 tokens. No se especifica el mecanismo de atencion (si es multi-head clasico, GQA u otra variante), la funcion de activacion, el uso de normalizacion RMSNorm ni la posicion de las capas de normalizacion. Tampoco se detalla si el entrenamiento incluyo fases de instruccion, RLHF o DPO; el formato ChatML y la etiqueta "conversational" sugieren algun tipo de ajuste para dialogo, pero el procedimiento no esta documentado.

No se indica el numero de tokens de entrenamiento, la composicion del corpus (proporcion de texto web, literatura, refranes, dialogos, etc.) ni los hiperparametros. La unica innovacion tecnica destacable mencionada es el sesgo deliberado del corpus hacia conocimiento cultural ruso, que se refleja en los resultados de MERA 2.0 en los subconjuntos RUBIN, LIMUR y Characters. No hay mencion a decodificacion especulativa, atencion lineal ni tecnicas de eficiencia mas alla del propio tamano reducido del modelo.

## Capacidades

- Generacion de texto conversacional en ruso con formato de chat ChatML.
- Razonamiento basico de sentido comun y respuesta a preguntas de cultura general rusa (subconjunto Reasoning de MERA 2.0 con 0,119 de exact match).
- Conocimiento de refranes, dichos y sabiduria popular rusa (RUBIN, 0,282).
- Reconocimiento de personajes y referencias culturales rusas (Characters, 0,186).
- Tareas de literatura y cultura (LIMUR, 0,222).
- Puntuacion y ortografia en ruso por encima de modelos mucho mayores segun el autor (SAGE PUNCT_F1 de 0,267).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue: el modelo esta etiquetado unicamente como ruso.
- No dispone de vision, audio ni modo de razonamiento extendido ("thinking").

## Casos de uso

- Generacion de texto offline en dispositivos embebidos: con 167 MB en F16 y 1024 tokens de contexto, el modelo cabe en memoria de sistemas con muy poca RAM (Raspberry Pi, routers, telefonos antiguos) y puede generar texto en ruso sin conexion, lo que lo hace adecuado para demos educativas de IA en hardware minimo.
- Prototipado rapido de interfaces conversacionales en ruso: permite montar un chatbot de prueba con Ollama o LM Studio en minutos para validar flujos de UI antes de invertir en un modelo mayor.
- Filtrado y clasificacion ligera de texto ruso: por su coste casi nulo, puede usarse como primera etapa para tareas de normalizacion, deteccion de puntuacion o generacion de variantes de una frase antes de pasar a un modelo mas capaz.
- Educacion e investigacion sobre modelos from-scratch: sirve como caso de estudio reproducible de un modelo entrenado desde cero con tokenizador propio, util para cursos de NLP y para experimentos sobre el efecto del corpus en el conocimiento cultural.
- Generacion de contenido folclorico y de entretenimiento: su sesgo hacia refranes, personajes y cultura rusa lo hace apropiado para generar adivinanzas, dichos o descripciones de personajes en aplicaciones ludicas o educativas en ruso.
- Correccion ortografica y de puntuacion asistida en ruso: el autor reporta un PUNCT_F1 de 0,267 en SAGE, superior al de modelos de 4B, por lo que puede emplearse como corrector ligero en editores de texto o pipelines de preprocesado.
- Pruebas de regresion y benchmarking de infraestructura: al ser tan pequeno, es util para validar despliegues de llama.cpp, Ollama o LM Studio y medir latencia base antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Los unicos datos publicados son los de la model card, correspondientes al liderboard publico MERA 2.0 en metrica Exact match, comparando con SmolLM-3B:

| Metrica | Zernyshko 1.6 (83M) | SmolLM-3B (3B) |
|---|---|---|
| Puntuacion global MERA 2.0 | 0,049 | 0,049 |
| Reasoning | 0,119 | 0,063 |
| Culture Specific | 0,103 | 0,090 |
| RUBIN (refranes y sabiduria popular) | 0,282 | 0,042 |
| LIMUR | 0,222 | 0,102 |
| Characters (personajes) | 0,186 | 0,116 |

El autor compara ademas con otros modelos en subconjuntos concretos:

| Metrica | Zernyshko 1.6 (83M) | Qwen3.5-4B | gemma-4-E2B | GFusion-10B-A1.8B |
|---|---|---|---|---|
| RUBIN | 0,282 | 0,259 | 0,249 | 0,183 |
| Culture Specific | 0,103 | 0,057 | no disponible | no disponible |
| Characters | 0,186 | no disponible | no disponible | 0,166 |
| LIMUR | 0,222 | no disponible | no disponible | 0,217 |
| SAGE PUNCT_F1 | 0,267 | 0,032 | 0,159 | no disponible |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otras pruebas estandar en la informacion disponible. Los datos de MERA 2.0 proceden del autor y no se ha verificado su reproducibilidad de forma independiente en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 200-300 MB en F16 (pesos de 167 MB mas overhead de contexto y runtime); no se publican cifras oficiales.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; el modelo esta pensado para CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna e integrada; tambien en CPU sin GPU.
- Despliegue: llama.cpp (`llama-cli -hf DICPlay/RusMind-Zernyshko-1.6-GGUF -cnv`), Ollama (`ollama run hf.co/DICPlay/RusMind-Zernyshko-1.6-GGUF`) y LM Studio (busqueda "RusMind Zernyshko"). No se documenta soporte para vLLM ni TGI.
- Latencia y throughput estimados: no disponibles. El autor menciona ejecucion en un Nokia N95, un frigorifico inteligente y una tetera como anecdotas de viabilidad, sin cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| RusMind Zernyshko 1.6 | 83 M | 1024 | RusMind License (no comercial sin contrato) | Ruso | Entrenado desde cero, tokenizador propio de 16k |
| SmolLM-3B | 3 B | no disponible en la ficha | no disponible | Multilingue (principalmente ingles) | Referencia del autor para MERA 2.0; mismo global de 0,049 |
| Qwen3.5-4B | 4 B | no disponible en la ficha | no disponible | Multilingue | Superado por Zernyshko en RUBIN, Culture Specific y PUNCT_F1 segun el autor |
| gemma-4-E2B | 2 B efectivos (MoE) | no disponible en la ficha | no disponible | Multilingue | Superado en RUBIN y PUNCT_F1 segun el autor |

La comparacion es asimetrica: los modelos alternativos son multilingues y de proposito general, mientras que Zernyshko esta especializado en ruso y su ventaja se limita a subconjuntos culturales concretos. En capacidad general y contexto, los modelos de 2B a 4B son muy superiores.

## Limitaciones y advertencias

- Capacidad general muy limitada por sus 83 M de parametros: no es adecuado para razonamiento complejo, matematicas, codigo ni tareas de varios pasos.
- Ventana de contexto de solo 1024 tokens, insuficiente para documentos largos o conversaciones extensas.
- Entrenado y etiquetado unicamente en ruso; el rendimiento en castellano u otros idiomas no esta documentado y previsiblemente sera muy deficiente.
- Riesgo elevado de alucinacion y de respuestas incoherentes en temas fuera de su corpus, dado el tamano y la falta de datos sobre el entrenamiento.
- Sesgos potenciales derivados de un corpus ruso propio no documentado: posible sobrerrepresentacion de determinadas fuentes, perspectivas culturales o registros.
- Licencia RusMind License: uso gratuito solo para fines personales, no comerciales, de investigacion y evaluacion; el uso comercial, la reventa, la distribucion de versiones modificadas y la integracion en productos requieren contrato escrito con DICPlay. La modelo se ofrece "tal cual", sin garantias.
- Los benchmarks de MERA 2.0 proceden del propio autor y no se ha verificado su reproducibilidad de forma independiente; deben interpretarse con cautela.
- No se documenta soporte de tool calling, agentes ni modo de razonamiento, lo que limita su uso en pipelines automatizados complejos.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/DICPlay/RusMind-Zernyshko-1.6-GGUF
- Repositorio base con pesos safetensors: https://huggingface.co/DICPlay/RusMind-Zernyshko-1.6
- Archivo F16 GGUF: https://huggingface.co/DICPlay/RusMind-Zernyshko-1.6-GGUF/blob/main/RusMind-Zernyshko-1.6-F16.gguf
- Licencia: https://huggingface.co/DICPlay/RusMind-Zernyshko-1.6-GGUF/blob/main/LICENSE
- Liderboard MERA 2.0: no disponible en la informacion proporcionada
- Paper o blog tecnico del modelo: no disponible
- Demo o espacio interactivo: no disponible
