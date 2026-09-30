# HaoWang00/EWAM

## Resumen

EWAM (Emergent Depth-Wise Specialization in a Unified Embodied Model) es un modelo unificado para robótica encarnada desarrollado por Hao Wang y colaboradores en Yinwang Intelligent Technology Co. Ltd. Procesa de forma conjunta tres flujos de tokens —vision-lenguaje, video futuro y acciones— dentro de un unico Diffusion Transformer con flow matching. Su aportacion principal es que, sin ningun diseno de etapas explicito, la corriente de accion aprende una especializacion por profundidad: las capas superficiales recuperan semantica de instruccion y escena actual desde el experto de vision-lenguaje, las intermedias se desplazan hacia representaciones de fotogramas futuros predichos y las profundas quedan dominadas por autoatencion de accion para el refinamiento motor.

El modelo tiene aproximadamente 8,8 mil millones de parametros y se construye sobre dos modelos base: Wan2.2-TI2V-5B (experto de video, ~5,00B) y Qwen3-VL-2B-Instruct (experto de vision-lenguaje, ~2,44B), a los que se anaden una fusion por proyecciones QKV por capa (~0,76B) y un experto de accion ligero (~0,64B). El repositorio ocupa 68,2 GB y se distribuye como checkpoints en formato DeepSpeed.

Es relevante ahora porque aborda el problema de la fragmentacion en la robotica basada en modelos: en lugar de encadenar modulos separados de percepcion, prediccion y control, integra todo en un unico transformer con una mascara de atencion asimetrica, unificando acciones y estados en un espacio de 16 dimensiones con relleno para cubrir distintos cuerpos roboticos. Los resultados reportados en RoboTwin 2.0 y LIBERO son altos, si bien el modelo es muy reciente y no tiene descargas ni validacion externa todavia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer unificado con flow matching; tres flujos de tokens (video, vision-lenguaje, accion) con mascara de atencion asimetrica |
| Parametros totales | ~8,8B (video ~5,00B + vision-lenguaje ~2,44B + fusion QKV ~0,76B + accion ~0,64B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (los componentes Wan2.2 y Qwen3-VL conservan sus licencias originales) |
| Formato de pesos | Checkpoints en directorio estilo DeepSpeed con `mp_rank_00_model_states.pt` |

## Arquitectura y entrenamiento

EWAM es un unico transformer desruidor (denoising transformer) que procesa tres corrientes de tokens de forma conjunta. El experto de video se inicializa desde Wan2.2-TI2V-5B y desruida los latentes de video futuro. El experto de vision-lenguaje se inicializa desde Qwen3-VL-2B-Instruct y se fusiona en cada capa mediante proyecciones QKV por capa. El experto de accion, un transformer ligero, desruida el fragmento de accion (action chunk). Las corrientes interactuan mediante una mascara de atencion asimetrica: los tokens de accion atienden a las tres corrientes, mientras que los tokens de video y de vision-lenguaje solo atienden dentro de su propia corriente. Las acciones y los estados se unifican en un espacio de 16 dimensiones con relleno, de modo que un solo modelo cubre distintos cuerpos roboticos; las dimensiones de relleno se enmascaran fuera de la perdida.

El modelo se publica en cuatro checkpoints: un preentrenamiento multi-fuente (etapa 1, usado como inicializacion), una variante RoboTwin 2.0 clean-to-random (16 GPU, batch efectivo 128, 20k pasos), una variante RoboTwin 2.0 in-domain (32 GPU, batch efectivo 256, 60k pasos) y una variante LIBERO (8 GPU, batch efectivo 64, 20k pasos). La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO.

## Capacidades

- Generacion de acciones roboticas a partir de instrucciones en lenguaje natural y observacion visual actual.
- Comprension de vision-lenguaje integrada mediante el experto derivado de Qwen3-VL-2B-Instruct.
- Prediccion de fotogramas futuros de video (visual foresight) como representacion intermedia.
- Control motor unificado en un espacio de accion/estado de 16 dimensiones con relleno, valido para multiples cuerpos roboticos.
- Especializacion emergente por profundidad en la corriente de accion (semantica en capas superficiales, prediccion futura en capas intermedias, refinamiento motor en capas profundas).
- Soporte de multiples plataformas roboticas: se reportan resultados en Franka, Dobot y Unitree G1-D (en el informe tecnico).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.

## Casos de uso

- Manipulacion robotica guiada por instrucciones: el modelo recibe una orden en lenguaje natural y la observacion visual actual, predice el fotograma futuro y genera el fragmento de acciones para brazos manipuladores; es adecuado por su integracion de semantica de instruccion en las capas superficiales.
- Evaluacion en entornos simulados RoboTwin 2.0: las variantes `robotwin_c2r` y `robotwin_indomain` estan entrenadas especificamente para ello, con tasas de exito medias de 77,2% y 92,9% respectivamente.
- Evaluacion en el benchmark LIBERO: el checkpoint `libero` alcanza un 98,8% de media, lo que lo hace util como linea base para comparativas de politica visomotora.
- Investigacion sobre especializacion profunda en transformers: la division de trabajo emergente entre capas de accion lo convierte en objeto de estudio para analisis de interpretabilidad.
- Control de multiples morfologias roboticas: gracias al espacio de accion/estado unificado de 16 dimensiones con enmascarado de relleno, un mismo modelo puede adaptarse a brazos tipo Franka o Dobot y a humanoides como el Unitree G1-D.
- Punto de partida para ajuste fino: el checkpoint de preentrenamiento multi-fuente esta pensado como inicializacion para reentrenamiento en nuevas tareas o cuerpos roboticos.
- Investigacion de world models para robotica: la corriente de video futuro permite estudiar la prediccion de consecuencias visuales antes del control motor.

## Benchmarks y rendimiento

| Benchmark | Configuracion | Tasa de exito (%) |
|---|---|---|
| RoboTwin 2.0 | Clean-to-random: C2C / C2R / media | 82,2 / 72,1 / 77,2 |
| RoboTwin 2.0 | In-domain: Clean / Randomized / media | 93,0 / 92,8 / 92,9 |
| LIBERO | Spatial / Object / Goal / Long / media | 98,6 / 99,8 / 98,6 / 98,2 / 98,8 |

En el informe tecnico se reportan ademas resultados en robots reales (Franka, Dobot y Unitree G1-D). La informacion disponible no incluye comparaciones numericas directas con otros modelos en estos mismos benchmarks.

## Requisitos de hardware

- Memoria de GPU para inferencia/evaluacion: aproximadamente 41 GB de VRAM, segun la model card.
- GPU recomendadas: A100-80G o H100 (recomendadas explicitamente para evaluacion).
- Entrenamiento: mas de 80 GB por GPU.
- GPU de consumo: no cabe en GPU de consumo; no se indica soporte para tarjetas de 24 GB o inferiores.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; los pesos se distribuyen como directorios estilo DeepSpeed con `mp_rank_00_model_states.pt`, y los pipelines de entrenamiento y evaluacion dependen de un repositorio de codigo aun no publicado.
- Dependencias adicionales: es necesario descargar por separado Wan2.2-TI2V-5B y Qwen3-VL-2B-Instruct, que aportan configuraciones, tokenizadores, VAE y el codificador T5 usados en inferencia.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han publicado comparaciones con otros modelos en la informacion disponible. Como referencia interna, EWAM integra dos modelos base identificados:

| Modelo | Parametros | Rol en EWAM | Licencia |
|---|---|---|---|
| Wan2.2-TI2V-5B | ~5,00B | Experto de video | La de su repositorio original |
| Qwen3-VL-2B-Instruct | ~2,44B | Experto de vision-lenguaje | La de su repositorio original |
| EWAM (total) | ~8,8B | Modelo unificado | Apache 2.0 |

Modelos alternativos de robotica encarnada de la misma categoria: no disponible.

## Limitaciones y advertencias

- Modelo muy reciente: 0 descargas y 0 likes en HuggingFace, sin validacion externa conocida.
- Los pesos del backbone no se incluyen en el repositorio; hay que descargar Wan2.2-TI2V-5B y Qwen3-VL-2B-Instruct por separado, lo que anade dependencias y posibles incompatibilidades de version.
- Solo se publican benchmarks en simulacion (RoboTwin 2.0 y LIBERO); los resultados en robots reales solo aparecen en el informe tecnico, no en la model card.
- No se especifican sesgos conocidos ni comportamiento multilingue; los idiomas soportados figuran como no disponibles.
- Riesgo de alucinacion: no evaluado en la informacion disponible; al integrar un experto de vision-lenguaje, es plausible que se hereden los sesgos del modelo base Qwen3-VL-2B-Instruct, aunque no se cuantifica.
- Restricciones de licencia: los pesos y el codigo de EWAM son Apache 2.0, pero los componentes Wan2.2 y Qwen3-VL conservan sus licencias originales, que deben revisarse para uso comercial.
- El repositorio de codigo para entrenamiento y evaluacion esta anunciado como "coming soon", por lo que reproducir los resultados requiere implementacion propia.
- Requisitos de hardware elevados (~41 GB para evaluacion, >80 GB por GPU para entrenamiento), lo que excluye GPU de consumo.
- No hay datos publicados sobre cuantizacion, latencia, throughput ni longitud de contexto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HaoWang00/EWAM
- Pagina del proyecto: https://wanghao00pro.github.io/EWAM-project/
- Informe tecnico (PDF): https://wanghao00pro.github.io/EWAM-project/assets/EWAM_Technical_Report.pdf
- Modelo base de video Wan2.2-TI2V-5B: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Modelo base de vision-lenguaje Qwen3-VL-2B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Repositorio de codigo: anunciado como "coming soon", sin URL disponible.
