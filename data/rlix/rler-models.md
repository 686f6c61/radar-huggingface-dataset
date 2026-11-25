# rlix/rler-models

## Resumen
RLER research checkpoints es un repositorio de adaptadores LoRA de investigación publicados por el usuario rlix, orientado al estudio de la metacognición en modelos de lenguaje: cuándo un modelo debe revisar una respuesta, solicitar más información o actuar a partir de la evidencia aportada por otro agente. No se trata de un modelo base entrenado desde cero, sino de una colección de checkpoints de adaptadores derivados de modelos como Qwen3.5-4B, organizados por estudio, condición experimental y paso de optimización.

El repositorio documenta experimentos de aprendizaje por refuerzo (PPO y otras condiciones) sobre tareas de decisión, calibración y enrutamiento de intenciones, con atribución explícita a conjuntos de datos públicos como MutualFriends, MultiWOZ 2.2, CLINC150, ShARC, PAWS-Wiki, SQuAD 2.0, VQA y Bike Sharing. Su relevancia es fundamentalmente metodológica: preserva adaptadores, configuraciones y sumas de verificación para reproducir experimentos sobre cuándo un modelo debe pedir ayuda o corregirse.

El tamaño del repositorio (552,4 GB) refleja el almacenamiento de múltiples checkpoints y objetos direccionados por hash, no un único modelo de ese tamaño. La licencia del repositorio es Apache 2.0, mientras que cada modelo base conserva su propia licencia upstream, indicada en el campo `upstream_license` de cada registro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA sobre modelos base transformer (p. ej. Qwen3.5-4B); arquitectura exacta del base no disponible |
| Parametros totales | No disponible (adaptadores LoRA; el modelo base de referencia documentado es Qwen3.5-4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (repositorio); licencia upstream por modelo base en el campo `upstream_license` |
| Formato de pesos | Adaptadores en formato Tinker (LoRA); conversión a safetensors/GGUF no documentada |

## Arquitectura y entrenamiento
Los artefactos son adaptadores LoRA entrenados mediante aprendizaje por refuerzo sobre modelos base preentrenados. El repositorio organiza los checkpoints por carpeta de estudio, que identifica el modelo base, la condición de entrenamiento y el paso del optimizador. Los pesos se almacenan una sola vez bajo `objects/sha256/` y se referencian mediante un catálogo legible por máquina (`catalog.json`), con sumas de verificación del archivo y de cada componente.

El entrenamiento cubre varias condiciones experimentales: PPO con actualizaciones del optimizador (se documenta un checkpoint de Qwen3.5-4B tras 16 actualizaciones), estudios de recurrencia social y solitaria, enrutamiento de intenciones con CLINC150, decisiones de calibración con ShARC, PAWS y SQuAD 2.0, apuestas en preguntas visuales con VQA y pronóstico de éxito con Bike Sharing. Los datos de entrenamiento originales no se distribuyen; solo se liberan los tensores LoRA aprendidos y sus configuraciones. Se incluye una verificación de replay de inferencia: tras fusionar el adaptador en el base fijado, la comparación con el sampler original de Tinker en un prompt aritmético greedy produjo los mismos cuatro token IDs, con una diferencia absoluta máxima de 0,00855 en log-probabilidades.

## Capacidades
- Generación de texto y razonamiento sobre modelos base transformer (capacidades heredadas del base, no documentadas en detalle).
- Metacognición: decisión de revisar una respuesta, solicitar información adicional o actuar con la evidencia de otro agente.
- Razonamiento multiagente en escenarios simulados (estudios social-worlds y de recurrencia social/solitaria).
- Enrutamiento de intenciones y detección de peticiones fuera de dominio (CLINC150).
- Calibración y decisión ante reglas conversacionales (ShARC) y paráfrasis (PAWS-Wiki).
- Manejo de preguntas sin respuesta y verificación factual (SQuAD 2.0).
- Apuestas y agregación de votos en preguntas visuales (VQA).
- Pronóstico de éxito emparejado (Bike Sharing, UCI).
- Memoria factual sobre tablas (WikiSQL).
- Soporte de tool calling, agentes y multimodalidad: no disponible de forma explícita en la información proporcionada.

## Casos de uso
- Investigación en metacognición de LLM: usar los checkpoints para comparar condiciones experimentales sobre cuándo el modelo decide revisar o pedir información, con registros de paso y condición que permiten reproducir trayectorias.
- Reproducción de experimentos de RL: restaurar un adaptador con `restore_adapter.py` a partir de un commit de 40 caracteres y el registro del estudio, verificando la integridad del archivo y de cada miembro.
- Evaluación de calibración: emplear los adaptadores entrenados con ShARC, PAWS y SQuAD 2.0 para estudiar la fiabilidad de las decisiones del modelo ante reglas y paráfrasis.
- Estudio de sistemas multiagente: analizar cómo un agente incorpora o descarta la evidencia aportada por otro en los escenarios de social-worlds.
- Enrutamiento de peticiones en producción experimental: adaptar los checkpoints de CLINC150 para evaluar la detección de intenciones y de peticiones fuera de alcance antes de desplegar un clasificador propio.
- Análisis de memoria factual: utilizar los adaptadores de WikiSQL para estudiar la recuperación y verificación de datos tabulares.
- Auditoría de atribución de datos: revisar los campos `upstream_license` y las fuentes citadas (MutualFriends, MultiWOZ 2.2, CLINC150, ShARC, PAWS, SQuAD 2.0, VQA, Bike Sharing) para trazar el origen de cada condición experimental.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El único dato cuantitativo es la verificación de replay de inferencia: coincidencia en cuatro token IDs y diferencia absoluta máxima de 0,00855 en log-probabilidades frente al sampler original de Tinker para un checkpoint PPO de Qwen3.5-4B tras 16 actualizaciones.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible; depende del modelo base sobre el que se fusione cada adaptador (el base documentado es Qwen3.5-4B).
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; para un base de 4B en cuantización de 16 bits se requeriría del orden de 8-10 GB de VRAM, pero este cálculo no está confirmado por el autor.
- Opciones de despliegue: Tinker para servir los adaptadores en su formato original; para servir fuera de Tinker se indica una receta de conversión específica por modelo, con conversión de pesos de proyección en algunas arquitecturas. vLLM, llama.cpp, Ollama y TGI no se mencionan.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RLER research checkpoints (rlix) | Colección de adaptadores LoRA de investigación | No disponible (base Qwen3.5-4B documentado) | No disponible | Apache 2.0 (repo) | Hugging Face, 0 descargas, 1 like |
| Adaptadores LoRA públicos de Qwen3.5-4B | Adaptadores sobre el mismo base | 4B (base) | No disponible | Según base | No disponible |
| Checkpoints de RL para metacognición (otros grupos) | Adaptadores o modelos completos | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias
- No es un modelo listo para producción: son checkpoints de investigación con controles y condiciones fallidas incluidas en el catálogo.
- Los adaptadores están en formato Tinker; servirlos fuera de Tinker exige una receta de conversión específica por modelo y, en algunas arquitecturas, conversión de pesos de proyección.
- Continuar una trayectoria del optimizador requiere estado de entrenamiento, configuración y estado aleatorio que no se distribuyen.
- La revisión pública del modelo base es una referencia registrada; la compilación interna del proveedor de investigación puede diferir.
- Los datos de entrenamiento originales y las conversaciones humanas no se incluyen; solo se liberan los tensores LoRA y las configuraciones.
- La licencia Apache 2.0 cubre los artefactos RLER, pero cada modelo base y cada conjunto de datos de origen conservan sus propios términos (CC BY 3.0, CC BY-SA 3.0, CC BY-SA 4.0, CC BY 4.0, entre otros).
- Idiomas soportados no documentados; riesgo de sesgo y alucinación heredado del modelo base, sin evaluación publicada en este repositorio.
- El repositorio tiene 0 descargas y 1 like, sin validación externa de la comunidad.
- La verificación de replay se limita a un único prompt aritmético greedy y cuatro token IDs; no constituye una validación general de la calidad del adaptador.

## Enlaces
- Repositorio en Hugging Face: https://huggingface.co/rlix/rler-models
- Checkpoints por estudio: https://huggingface.co/rlix/rler-models/tree/main/studies
- Catálogo legible por máquina: https://huggingface.co/rlix/rler-models/blob/main/catalog.json
- Resultados de investigación: https://rler-hiddenbench-study.yihao.chatgpt.site/research/bridge/today/error-or-revision
- Catálogo de pares de archivos externos (Tinker): https://huggingface.co/rlix/rler-models/tree/main/external
- Kit de recuperación (ZIP): https://huggingface.co/rlix/rler-models/resolve/main/recovery-kit.zip?download=true
- Checkpoint verificado en su revisión inmutable: https://huggingface.co/rlix/rler-models/blob/34801ac743750545090065e8631acdb9879e87d7/studies/proper-baseline-rl-20261117-group-20261117/qwen3-5-4b/group-u16/step-000016.json
- Conversión de adaptadores Tinker: https://github.com/thinking-machines-lab/tinker-cookbook/tree/main/tinker_cookbook/weights
- Estudio MutualFriends: https://aclanthology.org/P17-1162/
- Estudio MultiWOZ 2.2: https://aclanthology.org/2020.nlp4convai-1.13/
- CLINC150 (paper): https://aclanthology.org/D19-1131/
- CLINC150 (dataset y licencia): https://github.com/clinc/oos-eval/blob/828f8093932c8fe6ca7936c3d2e52903b1c523de/LICENSE
- ShARC: https://sharc-data.github.io/data.html
- PAWS-Wiki y términos de origen: https://github.com/google-research-datasets/paws
- SQuAD 2.0: https://rajpurkar.github.io/SQuAD-explorer/
