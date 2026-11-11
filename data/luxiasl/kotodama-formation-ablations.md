# LuxiaSL/kotodama-formation-ablations

## Resumen

`kotodama-formation-ablations` es una coleccion de pesos de modelos de aproximadamente 1.400 millones de parametros entrenados desde cero por LuxiaSL (con el repositorio de codigo alojado en la organizacion anima-research) para estudiar ablaciones de arquitectura sobre el modelo base `kotodama-tsumugi-1b`. No es un modelo pensado para uso en produccion ni para inferencia general, sino un conjunto de ejecuciones controladas que aíslan el efecto de decisiones de diseno concretas: profundidad, Attention Residuals (AttnRes), ubicacion de los bloques AttnRes y el bloque intermedio con bucle (looped depth).

Cada rama del repositorio corresponde a una ejecucion independiente de unos 1.400 millones de parametros entrenada durante 4.000 millones de tokens (1.908 pasos de 2.097.152 tokens por paso), con tasa de aprendizaje constante y decaimiento en el ultimo 20% del entrenamiento. El orden de los datos y las semillas de inicializacion estan fijados (semilla de datos 42; semillas de inicializacion 42, 43 y 44), de modo que cada ejecucion modifica una sola variable respecto al diseno de referencia de tsumugi.

El interes actual de este repositorio es metodologico: permite reproducir y auditar experimentos de ablacion sobre arquitecturas transformer con profundidad recursiva y conexiones residuales atencionales, con pesos en bf16 listos para cargar mediante la libreria `kotodama`. El repositorio ocupa 101,1 GB y contiene unicamente pesos, sin estado del optimizador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Attention Residuals (AttnRes) y profundidad con bucle (looped depth) en las variantes correspondientes; variantes sin bucle y sin AttnRes incluidas como controles |
| Parametros totales | ~1,4B por ejecucion (formas de 52 capas x 1536 y de 28 capas x 2048) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), con `aliases.json` y `config.json` por rama |

## Arquitectura y entrenamiento

Las ejecuciones comparten una base transformer con dos mecanismos que se ablacionan de forma sistematica. El primero es el bucle de profundidad: en las variantes con `loop`, un bloque de capas intermedias se ejecuta dos veces por token, de modo que la forma de 52 capas x 1536 procesa 72 capas por token (las 20 centrales se repiten). El segundo son los Attention Residuals (AttnRes), bloques que modifican el flujo residual en posiciones concretas; las ejecuciones varian tanto su presencia como su ubicacion (por ejemplo, la geometria propia de tsumugi en 0,1,7,9,17,19,39,59 frente a la geometria del modelo de 3B estirada, o 7 y 13 bloques equiespaciados). Hay ademas controles sin AttnRes (`t36-tshape-noattn`, `t36-noattn-52`, `t38-noattn-28`) y una forma estandar de 1,4B de 28 capas x 2048 (`t38-uni7-28`, `t38-noattn-28`).

El entrenamiento es uniforme entre ramas: 4.000 millones de tokens en 1.908 pasos de 2.097.152 tokens, tasa de aprendizaje constante con decaimiento en el ultimo 20%, semilla de datos 42 y semillas de inicializacion 42, 43 y 44 segun la rama. La excepcion es `t25-deep10b-i42`, entrenada durante 12.500 millones de tokens. No se documentan en la informacion disponible la composicion del dataset, el uso de RLHF o DPO, ni innovaciones adicionales como decodificacion especulativa o atencion lineal. En los modelos con bucle, cada posicion de capa repetida lleva su propia copia de los pesos de la capa nucleo con valores identicos, por lo que `aliases.json` queda vacio y el cargador no necesita logica adicional.

## Capacidades

- Generacion de texto autoregresiva como capacidad base del transformer, sujeta a la calidad del checkpoint concreto (4.000 millones de tokens de entrenamiento, muy por debajo de un modelo finalista).
- Razonamiento y codigo: no se han publicado evaluaciones especificas en la informacion disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Carga programatica mediante `kotodama.ckpt.load` con referencias del tipo `hf:LuxiaSL/kotodama-formation-ablations@<rama>`, lo que permite seleccionar cada ablacion de forma determinista.

## Casos de uso

- Investigacion de ablaciones de arquitectura: cargar pares de ramas que difieren en una sola variable (por ejemplo, `t36-tshape-noattn` frente a `t33-tshape-fitted`) para medir el efecto de AttnRes con el resto de factores fijados.
- Estudio de profundidad recursiva: comparar `t32-loopfit-52` (42 capas con un bloque de 10 repetido, 52 por token) con `t32-deepfit-52` (52 capas sin bucle) para evaluar el intercambio entre parametros y computo por token.
- Reproduccion de experimentos: las semillas de datos e inicializacion fijas y las configuraciones en `configs/` del repositorio de kotodama permiten replicar las ejecuciones y verificar resultados.
- Analisis de geometria de bloques AttnRes: las ramas `t35-uni7-52`, `t35-uni13-52` y `t37-tshape-uniform` permiten estudiar el efecto de la densidad y el espaciado de los bloques residuales atencionales.
- Formacion de modelos pequenos desde cero: servir como referencia de receta de entrenamiento (4B tokens, 1.908 pasos, decaimiento final) para equipos que entrenan modelos de ~1,4B en clústeres modestos.
- Docencia y divulgacion tecnica: ilustrar de forma empirica que aporta cada componente arquitectonico, con checkpoints reales y comparables en lugar de descripciones teoricas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud para un modelo denso de ~1,4B en bf16, los pesos ocupan aproximadamente 2,8 GB; en cuantizacion de 8 bits, en torno a 1,4 GB, y en 4 bits, alrededor de 0,7 GB, mas la memoria de activaciones y cache KV, que depende de la longitud de contexto (no documentada).
- GPU recomendadas: no disponible. Para entrenamiento desde cero de un modelo de este tamano con pasos de 2.097.152 tokens se requiere hardware de clase A100/H100 en configuracion multi-GPU; la informacion disponible no detalla la topologia empleada.
- GPU de consumo: no confirmado por el autor. Por tamano de pesos, un modelo de ~1,4B en bf16 cabria en GPUs de consumo con 8-16 GB de VRAM, pero no se ha validado la compatibilidad con el cargador `kotodama` ni con runtimes estandar.
- Opciones de despliegue: la via documentada es la libreria `kotodama` (`from kotodama import ckpt; ckpt.load(...)`). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kotodama-formation-ablations | ~1,4B por rama | no disponible | Suite de ablaciones de arquitectura (AttnRes, looped depth) | Apache 2.0 | Hugging Face, multiples ramas |
| kotodama-tsumugi-1b | ~1,4B | no disponible | Modelo de referencia sobre el que se ablaciona | no disponible en la informacion | Hugging Face |
| Modelos densos ~1,4B de uso general (p. ej. familias tipo Qwen o SmolLM) | ~1,4B | decenas de miles de tokens en sus versiones actuales | Modelos finalistas con entrenamiento a gran escala e instruccion | variables | Hugging Face |

La comparacion directa con modelos finalistas no es significativa: las ramas de este repositorio han visto 4.000 millones de tokens (salvo `t25-deep10b-i42`, con 12.500 millones) y no incluyen ajuste por instrucciones ni evaluaciones publicadas, por lo que su proposito es experimental y no competitivo.

## Limitaciones y advertencias

- No es un modelo para produccion: son pesos de ablaciones con 4.000 millones de tokens de entrenamiento, sin ajuste por instrucciones ni evaluaciones de calidad publicadas.
- No se declaran idiomas soportados ni composicion del dataset, por lo que el comportamiento linguistico es incierto.
- Riesgo de alucinacion y de generacion incoherente elevado por el regimen de entrenamiento reducido; no debe usarse en aplicaciones con requisitos de fiabilidad.
- Sesgos desconocidos: al no documentarse los datos de entrenamiento, no es posible evaluar sesgos de genero, etnia, idioma o dominio.
- Longitud de contexto no documentada; no se debe asumir una ventana concreta sin verificar el `config.json` de cada rama.
- Multiples ramas comparten prefijo y solo se distinguen por el sufijo de semilla (`-i42`, `-i43`, `-i44`); cargar la rama equivocada invalida cualquier comparacion. Algunas ejecuciones de octubre (semilla 42 de varias ramas y el modelo estandar de 28 capas) no se conservaron.
- El repositorio ocupa 101,1 GB y contiene solo pesos, sin estado del optimizador, por lo que no permite reanudar el entrenamiento tal cual.
- Licencia Apache 2.0: permite uso comercial con atribucion, pero el autor no ofrece garantias sobre el rendimiento ni la idoneidad de los pesos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/LuxiaSL/kotodama-formation-ablations
- Modelo de referencia tsumugi: https://huggingface.co/LuxiaSL/kotodama-tsumugi-1b
- Repositorio de codigo y configuraciones de entrenamiento: https://github.com/anima-research/kotodama
