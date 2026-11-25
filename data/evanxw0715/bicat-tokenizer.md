# Evanxw0715/BiCAT-tokenizer

## Resumen

BiCAT-tokenizer es un tokenizador de acciones (action tokenizer) para robótica bimanual, concretamente el componente Bimanual Temporal Tokenizer (BTT) del trabajo BiCAT (Bimanual Coordination Action Tokenization). Lo desarrolla el equipo formado por Xuanwei Liu, Guipu Cao, Zhongyi Luo y Jiafei Duan, y se publica bajo el identificador Evanxw0715/BiCAT-tokenizer en Hugging Face. No es un modelo de lenguaje: es un codificador y decodificador discreto que convierte fragmentos de 32 pasos de acciones articulares de 14 dimensiones en tokens discretos y los reconstruye.

El modelo resuelve el problema de discretizar trayectorias motoras continuas de robots bimanuales YAM para que puedan tratarse como secuencias de tokens, un paso habitual en pipelines de robot learning que combinan modelos generativos de secuencias con control motor. Usa una arquitectura de codificador convolucional causal compartido por brazo con strides (2, 2) y un decodificador de consulta conjunta de 6 capas con dimensión de modelo 256, más una cuantización FSQ con niveles [8, 8, 6, 5] (1920 códigos por token).

Es relevante ahora porque propone una representación compacta y reutilizable de acciones bimanuales entrenada sobre más de 456 millones de frames de dos fuentes de datos (MolmoAct2-BimanualYAM-Dataset y lerobot/abc_130k_v3_train), con un error de reconstrucción bajo (RMSE articular de 0,060 rad) y un formato de salida compatible con el codec trainer de praxis. Su utilidad práctica depende de integrarse en ese ecosistema concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador convolucional causal por brazo compartido (strides 2, 2) + decodificador de consulta conjunta de 6 capas, `model_dim` 256 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32 pasos de accion (`action_horizon` 32 a 30 fps) |
| Tipos de cuantizacion | FSQ con niveles `[8, 8, 6, 5]` (1920 codigos por token); pesos en safetensors; no se documentan cuantizaciones de pesos |
| Idiomas soportados | no disponible (modelo de acciones, no de texto) |
| Licencia | no disponible |
| Formato de pesos | safetensors (checkpoint `pretrained_model` con pesos EMA) |
| Dimension de accion | 14-D posiciones articulares absolutas (6 articulaciones + 1 pinza por brazo, brazo izquierdo primero) |
| Pasos latentes por token | 8 por brazo |
| Tamano del repo | 0,2 GB |

## Arquitectura y entrenamiento

El tokenizador emplea un codificador convolucional causal compartido entre ambos brazos, con dos etapas de stride 2, seguido de un decodificador de consulta conjunta de 6 capas y dimensión de modelo 256. La acción de 14 dimensiones se normaliza con un rango compartido (`shared_action_min` y `shared_action_max` calculados sobre los extremos de los datos limpios, ambos brazos agrupados), y el brazo derecho se multiplica por `right_arm_sign = [-1, 1, 1, 1, -1, -1, 1]` antes de compartir el marco del brazo izquierdo. La salida discreta se obtiene mediante FSQ con niveles [8, 8, 6, 5], lo que da 1920 códigos por token y 8 pasos latentes por brazo para un fragmento de 32 pasos.

El entrenamiento se realizó durante 500.000 pasos con batch de 2048 por GPU en 4 B200 (8192 efectivos), lo que supone 4.100 millones de inicios de fragmento, aproximadamente 9 épocas sobre 456,4 millones de frames. Se usó optimizador con lr constante 5e-5, 200 pasos de warmup, betas (0,9, 0,95), grad clip 1,0, precisión bf16 y EMA con decay 0,995 (los pesos guardados en `pretrained_model` son los EMA). La pérdida final de entrenamiento fue 0,00123. Solo se usó la columna `action` (sin imágenes) de dos fuentes: MolmoAct2-BimanualYAM-Dataset (32.225 de 32.246 episodios, 76.010.338 frames) y lerobot/abc_130k_v3_train (128.589 de 129.225 episodios, 380.396.445 frames), mezcladas en su proporción natural de frames (aproximadamente 1:5). Se descartaron episodios con menos de 32 frames, valores no finitos, saltos de una sola articulación superiores a 1,0 rad o valores extremos fuera del percentil 0,01–99,99.

## Capacidades

- Tokenizacion y detokenizacion de fragmentos de 32 pasos de acciones bimanuales de 14 dimensiones en tokens discretos y viceversa.
- Representacion compacta: 8 pasos latentes por brazo con 1920 codigos por token mediante FSQ.
- Manejo de dos brazos con una convencion de espejo explicita (`right_arm_sign`) para compartir el marco del brazo izquierdo.
- Reconstruccion de trayectorias articulares con error bajo en datos de entrenamiento (RMSE articular de 0,060–0,061 rad).
- Integracion con el ecosistema praxis mediante `make_codec` y la configuracion `train_omnibicat_btt_500k`.
- No soporta generacion de texto, razonamiento, codigo, vision, tool calling ni agentes: es un componente de codificacion de acciones.
- No se documentan capacidades multilingues ni modos especiales (thinking, audio, vision).

## Casos de uso

- Tokenizacion de trayectorias para robot learning: convertir demostraciones bimanuales de 32 pasos en secuencias discretas que puedan alimentar modelos generativos de tokens en pipelines de imitacion o planificacion motora.
- Compresion de datasets de acciones: reducir 32×14 valores continuos a una representacion discreta compacta para almacenar o transmitir episodios de robots YAM con menor coste, manteniendo un error de reconstruccion de aproximadamente 0,06 rad de RMSE.
- Preprocesamiento en entrenamiento de politicas: usar el tokenizador como capa de codificacion fija antes de un transformer de acciones, aprovechando la configuracion `train_omnibicat_btt_500k` de praxis.
- Estandarizacion entre fuentes de datos: al entrenarse sobre MolmoAct2 y abc_130k_v3 con normalizacion compartida, sirve para homogeneizar acciones de distintos datasets bimanuales YAM antes de mezclarlos.
- Evaluacion de calidad de datos: el error de reconstruccion por fragmento permite detectar episodios anómalos o con saltos articulares, ya que una cola pequeña de fragmentos reconstruye mal (error máximo de 1,8–1,9 rad).
- Investigacion en tokenizacion de acciones: base reproducible para comparar esquemas FSQ, tamaños de fragmento o arquitecturas de codificador en robótica bimanual.

## Benchmarks y rendimiento

Los datos publicados son de reconstruccion sobre el propio conjunto de entrenamiento (200.000 fragmentos aleatorios de 32 frames por fuente, pesos EMA, fp32, espacio de acción bruto). No es generalización en held-out.

| Metrica | MolmoAct2 | abc_130k_v3 |
|---|---|---|
| MSE (14 dims) | 0,00314 | 0,00324 |
| RMSE articular | 0,060 rad | 0,061 rad |
| MAE articular | 0,043 rad | 0,045 rad |
| Error articular percentil 99 | 0,193 rad | 0,188 rad |
| RMSE de pinza | 0,022 | 0,023 |

El RMSE por articulación equivale al 1,3–1,6 % del rango de normalización (la pinza, aproximadamente el 2,2 %). La articulación con mayor error es la rotación de muñeca (articulación 5). No se han publicado resultados de benchmarks comparativos con otros tokenizadores en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el repo ocupa 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer moderna (8 GB o menos).
- GPU recomendadas: el entrenamiento usó 4× B200; para inferencia basta una GPU consumer (RTX 3060, RTX 4090) o incluso CPU para lotes pequeños.
- Cabe en GPU consumer: si, dado el tamano reducido del checkpoint.
- Opciones de despliegue: el codigo de referencia es praxis (`praxis.codecs.factory.make_codec`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de otros tokenizadores de acciones bimanuales comparables en la informacion proporcionada. El propio autor advierte que el rango de normalizacion difiere de tokenizadores BiCAT anteriores, por lo que los ids de token no son intercambiables con ellos. Comparativa: no disponible.

## Limitaciones y advertencias

- Solo se entrenó con la columna `action`; no procesa imágenes ni observaciones, por lo que no es un modelo de política completo.
- Las metricas de reconstruccion son sobre el conjunto de entrenamiento, no sobre datos held-out; la generalizacion a robots o entornos distintos no esta medida.
- Existe una cola de fragmentos con mala reconstruccion (error articular maximo de 1,8–1,9 rad), lo que puede introducir artefactos en trayectorias atipicas.
- La articulacion 5 (rotacion de muneca) concentra el mayor error.
- Los ids de token no son intercambiables con tokenizadores BiCAT anteriores por el cambio de rango de normalizacion.
- Licencia no disponible: no se puede confirmar el uso comercial sin consultar al autor.
- Depende del ecosistema praxis para su uso de referencia; no se documentan formatos alternativos de carga.
- Sin datos de sesgos, idiomas ni alucinacion por tratarse de un modelo de acciones; no aplica el analisis habitual de sesgos de texto.

## Enlaces

- Hugging Face: https://huggingface.co/Evanxw0715/BiCAT-tokenizer
- Paper (arXiv): https://arxiv.org/abs/2611.23499
- Dataset MolmoAct2-BimanualYAM-Dataset: no disponible (enlace no proporcionado)
- Dataset lerobot/abc_130k_v3_train: no disponible (enlace no proporcionado)
- Repositorio praxis: no disponible (enlace no proporcionado)
