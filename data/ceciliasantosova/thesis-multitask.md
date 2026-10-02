# CeciliaSantosova/thesis-multitask

## Resumen

`CeciliaSantosova/thesis-multitask` es un repositorio experimental publicado en HuggingFace por la usuaria CeciliaSantosova que contiene una implementacion de una arquitectura CNN-Transformer orientada a tareas multiples (multitask). No se trata de un modelo entrenado ni de un checkpoint con resultados publicados: el propio autor indica de forma explicita que `model.safetensors` es un checkpoint de inicializacion valido para pruebas de humo (smoke tests) y que no debe presentarse como un modelo con benchmarks. El repositorio funciona, por tanto, como base de codigo y plantilla de configuracion para experimentar con cambios de arquitectura antes de lanzar un entrenamiento completo.

El tamano real del modelo es de 33.088 parametros, una cifra que lo situa muy lejos de los modelos de lenguaje generativos: se trata de una configuracion "small" pensada para que los cambios arquitectonicos se puedan inspeccionar y depurar rapidamente. El repositorio incluye el fichero Python con el modelo y el punto de entrada de ejemplo o de entrenamiento, un `config.json` con los ajustes de arquitectura, un `training_args.json` con la receta de experimento por defecto y el checkpoint de inicializacion en formato safetensors.

Su relevancia actual es la de un recurso docente y de investigacion: permite estudiar el diseno de una fusion CNN + Transformer con cross attention, normalizacion RMSNorm, activacion ReLU y atencion de tipo flash dentro de un entorno reproducible y de coste computacional practicamente nulo. La licencia BSD-3-Clause facilita su reutilizacion y modificacion, siempre que se respeten las condiciones de atribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN Transformer (hibrida CNN + Transformer) |
| Parametros totales | 33.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors) |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors |

Datos adicionales declarados en la model card: escala "small", tipo de atencion "flash", fusion mediante "cross attention", activacion ReLU y normalizacion RMSNorm. Optimizador por defecto: NovoGrad con planificador exponencial.

## Arquitectura y entrenamiento

La arquitectura es una CNN Transformer de escala reducida. Combina un extractor convolucional con un bloque Transformer y fusiona las representaciones mediante cross attention. La atencion es de tipo flash, la activacion es ReLU y la normalizacion empleada es RMSNorm. La configuracion concreta de capas, dimensiones ocultas, numero de cabezas y resolucion de entrada esta registrada en el `config.json` del repositorio, pero no se detalla en la informacion disponible. El uso previsto de esta combinacion es el procesamiento de tareas multiples con caracteristicas tanto locales (via convolucion) como globales (via atencion).

En cuanto al entrenamiento, no hay evidencia de que se haya completado ninguno. La model card indica que la receta incluida (NovoGrad con planificador exponencial en `training_args.json`) son valores de partida del script, no el resultado de una ejecucion finalizada, y que el checkpoint publicado es unicamente una inicializacion valida para pruebas de humo. No se declara numero de tokens de entrenamiento, composicion del dataset, ni fases de RLHF, DPO o ajuste por instrucciones. El autor recomienda, para cualquier evaluacion futura, usar un conjunto de validacion especifico de la tarea, reportar la metrica a lo largo de al menos tres semillas aleatorias e incluir una linea base de capacidad equivalente, conservando los registros de entrenamiento y las versiones del entorno.

## Capacidades

- No se declara ninguna capacidad funcional verificada: el checkpoint publicado no ha sido entrenado ni auditado.
- Generacion de texto: no disponible.
- Razonamiento, codigo, matematicas o vision: no disponible.
- Tool calling o function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidad estructural destacable: plantilla ejecutable de arquitectura CNN-Transformer con cross attention, util para inspeccionar cambios de diseno y para ejecutar pruebas de humo (`python eval.py --help`, con ejemplo de smoke test en el bloque `__main__` del script).
- Requiere un adaptador explicito para cargarse con APIs genericas automaticas, al ser una implementacion personalizada.

## Casos de uso

- Investigacion sobre fusion de modalidades: el bloque de cross attention permite experimentar con la combinacion de caracteristicas convolucionales (locales) y representaciones Transformer (globales) en un unico modelo, con un coste de computo minimo que hace viable iterar sobre muchas variantes arquitectonicas.
- Pruebas de humo en pipelines de CI/CD: dado su tamano de 33.088 parametros, el checkpoint de inicializacion sirve para verificar que el codigo de carga, el `config.json` y el flujo de inferencia funcionan antes de invertir recursos en un entrenamiento real.
- Estudio de ablactions controladas: la model card recomienda entrenar todas las lineas base con la misma exposicion de datos, presupuesto de ajuste y semillas; este repositorio actua como punto de partida para ese tipo de comparaciones metodologicamente limpias.
- Docencia y formacion tecnica: es un ejemplo manejable para explicar como se estructura una arquitectura hibrida CNN-Transformer, como se define un `config.json` de arquitectura y como se separa la configuracion de entrenamiento en `training_args.json`.
- Prototipado de tareas multiples: la etiqueta "multitask" del repositorio apunta a escenarios donde una misma red debe resolver varias tareas; el esqueleto permite enganchar cabezas de salida adicionales y validar el flujo de datos antes de escalar.
- Base para experimentos de eficiencia: al usar atencion flash y RMSNorm, resulta util como banco de pruebas para medir el impacto de estas decisiones de implementacion en el consumo de memoria y el tiempo de paso hacia atras, sin que el tamano del modelo enmascare las diferencias.
- Referencia de reproducibilidad: la inclusión de versiones del entorno y registros de entrenamiento recomendada por el autor convierte al repositorio en una plantilla para documentar resultados de forma trazable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explicitamente que no se reclama ninguna puntuacion de benchmark en el repositorio y que el checkpoint es una inicializacion, no un modelo entrenado.

| Benchmark | Resultado |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Cualquier otra metrica | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB en precision completa (33.088 parametros equivalen a aproximadamente 132 KB en fp32 y unos 66 KB en fp16), mas el coste de activaciones, que depende de la resolucion de entrada configurada en `config.json` y no se detalla en la informacion disponible.
- GPU recomendadas: ninguna en particular. El modelo cabe en cualquier GPU con soporte CUDA, incluidas integradas y generaciones antiguas.
- Consumer GPU: si, en cualquier GPU de consumo actual o de varias generaciones anteriores; tambien se ejecuta sin problemas en CPU.
- Opciones de despliegue: no se declara compatibilidad con vLLM, llama.cpp, Ollama o TGI. Al ser una implementacion personalizada en PyTorch, la via natural es ejecutar el propio `eval.py` del repositorio; las APIs de carga automatica requieren un adaptador explicito.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se han encontrado en la informacion proporcionada modelos comparables de la misma categoria (arquitecturas hibridas CNN-Transformer de escala "small" con fusion por cross attention) con los que establecer una comparacion de parametros, contexto, rendimiento, licencia y disponibilidad. Ademas, al no existir checkpoint entrenado ni resultados de evaluacion, cualquier comparacion de rendimiento seria invalida.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CeciliaSantosova/thesis-multitask | 33.088 | no disponible | no disponible (sin entrenar) | BSD-3-Clause | HuggingFace, codigo y checkpoint de inicializacion |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El checkpoint publicado no ha sido entrenado. No debe utilizarse para inferencia en produccion ni para obtener predicciones con valor real.
- No ha sido auditado en robustez, equidad (fairness) ni transferencia de dominio, segun la propia model card.
- Riesgo de alucinacion: no aplica en el sentido de un modelo de lenguaje, pero si existe el riesgo de interpretar erroneamente el repositorio como un modelo funcional cuando es una plantilla de investigacion.
- No se declaran idiomas soportados, longitud de contexto ni conjunto de datos de entrenamiento, por lo que no es posible evaluar sesgos linguisticos ni de dominio.
- Los resultados de un futuro checkpoint entrenado deben documentarse por separado de los valores por defecto incluidos en el repositorio; mezclar ambos seria un error metodologico.
- Al ser una implementacion personalizada, las APIs genericas de carga automatica (por ejemplo, `AutoModel`) no funcionan sin un adaptador explicito.
- Licencia BSD-3-Clause: permisiva y apta para uso comercial, pero exige conservar el aviso de copyright y la clausula de exencion de responsabilidad. Los terminos de los datos de origen deben revisarse por separado si el repositorio se usa con conjuntos de datos externos.
- Para cualquier evaluacion seria se recomienda un conjunto de validacion especifico de la tarea, al menos tres semillas y una linea base de capacidad equivalente, conservando los registros de entrenamiento y las versiones del entorno.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CeciliaSantosova/thesis-multitask
- Perfil del autor en HuggingFace: https://huggingface.co/CeciliaSantosova
- Listado de modelos del autor: https://huggingface.co/CeciliaSantosova/models
- Repositorio relacionado del mismo autor: https://huggingface.co/CeciliaSantosova/multitask

Nota: los resultados de busqueda web incluian tambien un enlace a arXiv (https://arxiv.org/pdf/2404.18961), una entrada de LinkedIn sobre una tesis de MSc en modelos multitarea para parametros farmacocineticos y el resolutor de DOI (https://dx.doi.org/). Ninguno de ellos guarda relacion verificada con este modelo segun la informacion disponible, por lo que se citan unicamente como contexto y no como documentacion del mismo.
