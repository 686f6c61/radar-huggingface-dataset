# DecentVLA/droid_site8_pi05_cent

## Resumen

droid_site8_pi05_cent es un checkpoint de ajuste fino completo del modelo de robotica π0.5 (pi05), desarrollado por DecentVLA a partir de la receta oficial `pi05_full_droid_finetune` de openpi. Se trata de un modelo de politica visomotora (vision-language-action, VLA) orientado a control robotico por imitacion, entrenado sobre el split site8 del dataset DROID 1.0.1 y exportado en el formato oficial de checkpoint de openpi en JAX.

El modelo resuelve el problema de generar acciones motoras de chunk a partir de observaciones visuales e instrucciones en lenguaje natural. En esta variante concreta, el entrenamiento se ha realizado de forma centralizada: un unico modelo entrenado sobre los datos agregados de los 8 sitios del split, con batch de 256, frente a la variante federada FedAvg del mismo proyecto. Esto lo convierte en la referencia centralizada para comparar estrategias de entrenamiento federado en robotica.

La relevancia actual del checkpoint reside en su papel como linea base reproducible: mismo presupuesto de optimizacion (25.000 pasos), mismos datos (8.723 episodios de entrenamiento, 1.724.640 frames tras el filtro de inactividad de openpi) y mismo formato de servicio que el resto de brazos del estudio, lo que permite aislar el efecto del esquema de agregacion sobre la tasa de exito en RoboLab-120.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | π0.5 (vision-language-action, openpi, JAX); detalles internos de capas no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (horizonte de accion de 16 pasos) |
| Tipos de cuantizacion | no disponible (pesos exportados en bfloat16) |
| Idiomas soportados | no disponible (las instrucciones del dataset DROID estan en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoint openpi (JAX, bfloat16, pesos EMA, norm stats en `assets/droid`) |

## Arquitectura y entrenamiento

El modelo parte de `pi05_base` y se ajusta con la receta `pi05_full_droid_finetune` de openpi, un ajuste fino completo (no LoRA) con horizonte de 16 pasos, optimizador AdamW, learning rate de 5e-5 tras un calentamiento de 1.000 pasos, clipping de 1.0 y EMA de 0.99. Se emplean las estadisticas de normalizacion de posiciones articulares conjuntas de `pi05_droid_jointpos`. El entrenamiento se ejecuto con la infraestructura decent-vla en nodos con cuatro tarjetas de 96 GB, calculando cada batch como slices acumulados (dos de 128 en el caso centralizado).

Los datos provienen del split site8 de DROID 1.0.1: 8 clientes, cada uno correspondiente a una celda "etiqueta de edificio x colector" (RAIL, BAIR, TRI, EVGR C, Penn Levine 457, Autolab, Gates, BWW). Se seleccionaron episodios exitosos cuya instruccion empieza por un verbo de colocar, tomar o apilar, con un maximo de 1.500 por sitio y un 10 % reservado por sitio, resultando en 8.723 episodios de entrenamiento y 1.724.640 frames tras el filtro de inactividad de openpi (entre 573 y 1.350 episodios por cliente). El presupuesto es de 100 rondas de 250 pasos, con batch de cliente 32 y batch centralizado 256, sumando 25.000 pasos de optimizador por modelo y 6,4 millones de muestras de entrenamiento, identicas al brazo FedAvg. Se publican los checkpoints de las rondas 60 y 100.

## Capacidades

- Generacion de chunks de accion robotica de forma (15, 8) a partir de observaciones e instrucciones, verificado en el servidor openpi de RoboLab.
- Control visomotor por imitacion para tareas de manipulacion: colocar, tomar y apilar objetos.
- Seguimiento de instrucciones en lenguaje natural dentro del dominio de DROID.
- Ejecucion como politica de servidor mediante `scripts/serve_policy.py` de openpi con la configuracion `pi05_droid_jointpos`.
- Compatibilidad directa con el ecosistema openpi y con el servidor de RoboLab sin modificaciones.
- No se documentan capacidades de tool calling, razonamiento multi-paso, agentes, vision general, audio ni modo thinking; el modelo es una politica VLA, no un LLM conversacional.

## Casos de uso

- Evaluacion comparativa de federated learning en robotica: sirve como brazo centralizado de referencia frente al run FedAvg del mismo proyecto, con identico presupuesto de pasos y muestras, para medir el coste de la agregacion federada en tasa de exito.
- Manipulacion robotica en entornos de laboratorio tipo DROID: el modelo genera acciones conjuntas para tareas de pick-and-place y apilado entrenadas sobre episodios reales de ocho colectores distintos.
- Servicio de politica en RoboLab: se despliega con el servidor openpi en el puerto 8000 y responde con chunks de accion, integrandose en el bucle de control del robot.
- Reproduccion de experimentos openpi: la configuracion YAML incluida y los checkpoints de las rondas 60 y 100 permiten replicar curvas de entrenamiento y comparar estados intermedios frente al modelo final.
- Investigacion en generalizacion entre sitios: al agrupar datos de ocho celdas edificio-colector, permite estudiar el rendimiento cuando el modelo ve datos heterogeneos de multiples entornos.
- Base para ajuste fino posterior en dominios concretos: al ser un fine-tune completo sobre `pi05_base` con licencia Apache 2.0, puede reutilizarse como punto de partida para tareas de manipulacion especificas.
- Analisis de robustez ante distribuciones no vistas: el checkpoint de la ronda 60 frente al de la ronda 100 permite estudiar la evolucion del rendimiento con el entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la perdida de entrenamiento no se reporta como resultado y que la metrica de interes es la tasa de exito en RoboLab-120, pero no se incluyen los valores numericos de dicha evaluacion.

## Requisitos de hardware

- Entrenamiento realizado en nodos con cuatro GPU de 96 GB (por ejemplo, H100 o GH200 de 96 GB; el nombre del fichero de configuracion sugiere GH200).
- VRAM de inferencia estimada: no disponible; el repositorio ocupa 10,5 GB, pero el modelo se sirve en bfloat16 desde un checkpoint JAX y el consumo real depende del servidor openpi.
- GPU recomendadas para servicio: no disponible en la informacion proporcionada; por el regimen de entrenamiento, se espera que requiera aceleradores de datacenter, aunque no se confirma que quepa en GPU de consumo.
- Opciones de despliegue: servidor openpi mediante `scripts/serve_policy.py` con `--policy.config=pi05_droid_jointpos` y `--policy.dir` apuntando a `openpi/` u `openpi_r060/`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Se confirma que una peticion devuelve un chunk de acciones de forma (15, 8).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| droid_site8_pi05_cent | no disponible | no disponible | Centralizado, 6,4 M muestras, 25.000 pasos | Apache 2.0 | Hugging Face (este repo) |
| droid_site8_pi05_fedavg (brazo FedAvg del mismo estudio) | no disponible | no disponible | Federado, mismo presupuesto | Apache 2.0 (presumible, no confirmado) | No confirmado en la informacion disponible |
| pi05_base (openpi) | no disponible | no disponible | Preentrenamiento base | no disponible | openpi |
| pi05_droid_jointpos (openpi) | no disponible | no disponible | Ajuste fino sobre DROID | no disponible | openpi |

No se dispone de datos de rendimiento de los modelos comparables en la informacion proporcionada, por lo que la comparacion se limita a esquema de entrenamiento, licencia y disponibilidad.

## Limitaciones y advertencias

- Dominio restringido: entrenado solo con episodios de DROID cuyas instrucciones empiezan por verbos de colocar, tomar o apilar; el rendimiento fuera de ese vocabulario y de esas tareas no esta garantizado.
- Cobertura limitada a ocho celdas edificio-colector del split site8; la generalizacion a otros entornos, brazos o camaras no esta documentada.
- No se han publicado cifras de RoboLab-120 en la model card, por lo que no es posible verificar el rendimiento real sin ejecutar la evaluacion.
- Riesgo de sobreajuste a las estadisticas de normalizacion de `pi05_droid_jointpos`: el modelo asume esa convencion de posiciones articulares en el servicio.
- Licencia Apache 2.0 permite uso comercial, pero no se documentan sesgos, limitaciones idiomaticas ni advertencias de seguridad para operacion fisica de robots.
- El repositorio no incluye los checkpoints de decent-vla (27 GB cada uno), que quedan en el cluster de entrenamiento, lo que limita la inspeccion del estado intermedio del optimizador.
- No hay informacion sobre cuantizacion ni sobre despliegue en hardware de consumo, lo que restringe su uso en produccion fuera de entornos con aceleradores de datacenter.

## Enlaces

- Hugging Face: https://huggingface.co/DecentVLA/droid_site8_pi05_cent
- openpi (repositorio oficial de π0.5): no disponible en la informacion proporcionada
- Dataset DROID 1.0.1: no disponible en la informacion proporcionada
- RoboLab: no disponible en la informacion proporcionada
- decent-vla: no disponible en la informacion proporcionada
