# seomh/opd-qwen3inst4b-mathsft-qwen3moe30b-ot3math-step30

## Resumen

El modelo `seomh/opd-qwen3inst4b-mathsft-qwen3moe30b-ot3math-step30` es un ajuste fino de tipo SFT sobre una base de la familia Qwen3 con 4.022.468.096 parametros (aproximadamente 4,02 mil millones). Lo publica el usuario individual `seomh` en HuggingFace, con fecha de creacion del 8 de octubre de 2026, y el repositorio ocupa 8,1 GB, un tamano coherente con pesos en bf16 o fp16 (4,02 B x 2 bytes = 8,04 GB) mas los ficheros auxiliares.

Por la propia nomenclatura del identificador se puede inferir, aunque no esta confirmado en la informacion disponible, que se trata de un experimento de destilacion (el prefijo `opd` sugiere on-policy distillation) en el que un modelo estudiante denso de ~4 B, inicializado desde Qwen3-4B-Instruct, se entrena sobre datos de matematicas (`mathsft`, probablemente el conjunto OpenThoughts3 math, `ot3math`) generados por un profesor MoE de la familia Qwen3 con 30 B totales (`qwen3moe30b`, es decir, Qwen3-30B-A3B) en un checkpoint intermedio (`step30`). Es, por tanto, un artefacto de investigacion mas que un modelo listo para produccion.

Su relevancia es limitada y muy especifica: se trata de un checkpoint con 12 descargas y 0 likes, sin model card, sin licencia declarada y sin idiomas declarados. Resulta util como referencia para quien investigue tecnicas de destilacion de profesores MoE a estudiantes densos en dominios de matematicas, pero no como modelo de proposito general. Toda la informacion sobre arquitectura, contexto, capacidades y rendimiento mas alla de los parametros y el formato de pesos debe considerarse no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso de la familia Qwen3 (inferido del tag `qwen3`; no confirmado en la ficha del autor) |
| Parametros totales | 4.022.468.096 (~4,02 B) |
| Parametros activos | No aplica: los pesos publicados corresponden a un modelo denso, no a un MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos safetensors, presumiblemente bf16/fp16; no hay GGUF ni AWQ/GPTQ publicados) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 8,1 GB |
| Tokenizador | no disponible (se asume el de Qwen3, con vocabulario de 151.936 tokens, sin confirmar) |
| Descargas / likes | 12 / 0 |
| Fecha de publicacion | 2026-10-08 |

## Arquitectura y entrenamiento

No hay informacion publicada por el autor sobre la arquitectura concreta ni sobre el proceso de entrenamiento. El unico dato objetivo es el recuento de parametros de los ficheros safetensors (4.022.468.096) y el tag `qwen3`. Si el modelo deriva de Qwen3-4B, la arquitectura esperada seria un transformer decoder denso con atencion de consultas agrupadas (GQA), normalizacion RMSNorm, embeddings rotatorios (RoPE) y el tokenizador de Qwen3 con 151.936 entradas. Nada de esto aparece confirmado en la informacion disponible, por lo que debe tratarse como hipotesis de trabajo.

El identificador aporta pistas sobre el pipeline de entrenamiento: `qwen3inst4b` apunta a un estudiante Qwen3-4B-Instruct, `mathsft` a un ajuste supervisado sobre datos de matematicas, `qwen3moe30b` a un profesor MoE de 30 B totales (probablemente Qwen3-30B-A3B) y `ot3math` a un subconjunto del corpus OpenThoughts3 orientado a matematicas. El sufijo `step30` sugiere un checkpoint intermedio del entrenamiento. No se dispone de informacion sobre numero de tokens de entrenamiento, composicion del dataset, uso de RLHF/DPO, hiperparametros ni innovaciones tecnicas (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto y razonamiento paso a paso: esperable por herencia de Qwen3-4B-Instruct, pero no verificado ni documentado por el autor.
- Razonamiento matematico: es el dominio objetivo declarado de forma implicita en el nombre del modelo (`mathsft`, `ot3math`); no hay evaluacion publicada que lo confirme.
- Generacion de codigo: probable por la base Qwen3, sin datos de validacion disponibles.
- Tool calling / function calling: no disponible (no hay plantilla de chat ni documentacion al respecto en la ficha).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; el autor no declara idiomas.
- Modo "thinking" explicito: no disponible (Qwen3 lo soporta de forma nativa, pero se desconoce si se ha preservado tras el SFT).
- Vision, audio u otras modalidades: no disponible; no hay indicios de que el modelo sea multimodal.

## Casos de uso

- Investigacion en destilacion de conocimiento: el checkpoint permite analizar como un estudiante denso de ~4 B absorbe capacidades de razonamiento matematico de un profesor MoE de 30 B totales. Se usaria comparando curvas de perdida y exactitud en validacion frente a checkpoints anteriores del mismo run.
- Reproduccion de experimentos de SFT sobre matematicas: util como punto de partida para replicar el pipeline OpenThoughts3 math con otros estudiantes o presupuestos de computo.
- Generacion de datos sinteticos de matematicas: si el modelo conserva la capacidad de resolver problemas paso a paso, puede emplearse para producir trazas de razonamiento que despues se filtren y se reutilicen en entrenamientos posteriores.
- Evaluacion interna de checkpoints intermedios: un artefacto etiquetado como `step30` sirve para estudiar el efecto del numero de pasos de entrenamiento sobre la calidad del razonamiento, midiendo degradacion o mejora entre pasos.
- Prototipos locales de bajo coste: con pesos de ~8 GB en bf16, cabe en GPU de consumo y permite experimentar sin acceso a clústeres, siempre que se asuma la ausencia de garantias de calidad.
- Ajuste posterior en dominios especificos (LoRA/QLoRA): al ser un modelo de 4 B, es viable reentrenarlo en una unica GPU de 24 GB con adaptadores de bajo rango para tareas de matematicas, fisica o ingenieria.
- Analisis de artefactos publicados sin model card: sirve como caso de estudio sobre riesgos de trazabilidad y licencias en repositorios de HuggingFace.

No se recomienda su uso en atencion al cliente, generacion de codigo en produccion ni pipelines de agentes: no hay evidencia de soporte de tool calling, ni de calidad multilingue, ni de licencia que habilite uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha de HuggingFace no incluye model card, ni tablas de evaluacion, ni resultados de MMLU, GSM8K, MATH, HumanEval u otros conjuntos. Los 12 registros de descarga y la ausencia de likes indican que no existe una comunidad que haya reportado mediciones independientes.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: en torno a 8 GB solo para pesos, mas cache KV y activaciones; con contexto largo y lotes pequenos, entre 10 y 12 GB en la practica.
- VRAM estimada cuantizado a 8 bits: aproximadamente 4,3-5 GB de pesos.
- VRAM estimada cuantizado a 4 bits (si se generan GGUF): aproximadamente 2,4-2,8 GB de pesos.
- GPU recomendadas: A100 40/80 GB, H100 y L40S para despliegue con lotes grandes; RTX 4090, RTX 3090 y RTX 4080 (16-24 GB) para inferencia en bf16 sin problemas; RTX 4070 Ti, RTX 4070 y RTX 3060 de 12 GB suficientes en bf16 con contexto moderado.
- Cabe en GPU de consumo: si. En bf16 cabe en cualquier GPU con 12 GB o mas; cuantizado a 4 bits cabria incluso en tarjetas de 4-6 GB, siempre que se genere una version GGUF que el repositorio no incluye.
- Opciones de despliegue: transformers (necesario para bf16 nativo), vLLM y SGLang si la arquitectura es un Qwen3-4B estandar, TGI, llama.cpp y Ollama solo si se convierte previamente a GGUF. No hay artefactos listos para llama.cpp, Ollama, AWQ ni GPTQ en el repositorio.
- Latencia y throughput: no disponibles. No hay mediciones publicadas y, dado el estado del repositorio (checkpoint de investigacion sin validar), cualquier cifra seria especulativa.

## Comparativa con modelos similares

La comparativa se establece frente a la base presumible y a las alternativas de proposito general de tamano parecido. Los datos de las alternativas son informacion publica de sus respectivas fichas, no mediciones de este repositorio.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `seomh/opd-qwen3inst4b-mathsft-qwen3moe30b-ot3math-step30` | 4,02 B (denso) | no disponible | no disponible | 12 descargas, sin model card | Checkpoint de investigacion, sin evaluacion publicada |
| Qwen3-4B | 4,02 B (denso) | 32.768 tokens nativos, ampliable a 131.072 con YaRN | Apache 2.0 | Ampliamente disponible | Base de referencia con documentacion y benchmarks publicados |
| Qwen3-4B-Instruct-2507 | 4,02 B (denso) | 262.144 tokens | Apache 2.0 | Ampliamente disponible | Variante instruct con soporte de tool calling y contexto muy largo |
| Llama-3.1-8B-Instruct | 8,03 B (denso) | 131.072 tokens | Llama 3.1 Community License | Ampliamente disponible | El doble de parametros; requiere mas VRAM |
| Gemma-3-4B-IT | ~4 B (denso) | 131.072 tokens | Gemma Terms of Use | Ampliamente disponible | Alternativa multimodal en la misma franja de tamano |

No se dispone de datos de rendimiento del modelo evaluado que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia total de model card: no hay documentacion sobre datos de entrenamiento, hiperparametros, tokenizador ni plantilla de chat, lo que impide reproducir el pipeline con fidelidad.
- Licencia no declarada: sin licencia explicita, no existe autorizacion clara para uso comercial ni para redistribucion. Aunque la base Qwen3 se publique bajo Apache 2.0, este derivado no hereda automaticamente esa declaracion en su ficha.
- Riesgo elevado de alucinacion y de degradacion del formato: al ser un SFT especializado en matematicas, es probable que el modelo haya perdido parte de la alineacion conversacional y del formato instruct original, aunque no hay datos que lo confirmen.
- Riesgo de olvido catastrofico en tareas ajenas al dominio matematico: el ajuste sobre `ot3math` puede haber reducido el rendimiento en codigo, escritura o dialogo general.
- Idiomas no declarados: se desconoce si conserva competencia multilingue o si el ajuste lo ha sesgado hacia el ingles.
- Contexto desconocido: no se puede planificar su uso en tareas que requieran ventanas largas sin verificar experimentalmente la longitud efectiva soportada.
- Sesgos: no evaluados. No hay analisis de sesgos de genero, raza, religion o ideologia, ni de sesgos propios de los corpus de matematicas (por ejemplo, sesgo hacia problemas de estilo competicion anglosajona).
- Checkpoint intermedio: la etiqueta `step30` sugiere que no es el modelo final del run; puede presentar inestabilidad en la generacion y una calidad inferior a la de un checkpoint final.
- Sin garantias de tool calling: la ausencia de plantilla de chat y de pruebas hace desaconsejable integrarlo en pipelines de agentes o function calling.
- Idoneidad para produccion: baja. Deberia tratarse exclusivamente como material de investigacion hasta que exista una evaluacion independiente y una licencia explicita.

## Enlaces

- HuggingFace: https://huggingface.co/seomh/opd-qwen3inst4b-mathsft-qwen3moe30b-ot3math-step30
- No se han encontrado en la busqueda web otros enlaces asociados al modelo (papers, blogs, repositorios de codigo o demos).
