# Donghyun1228/pi05-libero-support-lora16-all-view-medium-n50000-10000-20261016

# Donghyun1228/pi05-libero-support-lora16-all-view-medium-n50000-10000-20261016

## Resumen

Se trata de un adaptador de tipo LoRA de rango 16 entrenado sobre un punto de control de la familia pi05 (stack openpi) para robótica de manipulación, concretamente para el conjunto de tareas LIBERO. El autor, Donghyun1228, parte de una fuente (`pi05-libero-support-probe-source-n50000-10000-20261015`, commit `ea4f0bb2`) y de un objetivo (`libero-support-random-waypoint-300k-20261015`, commit `32ed215b`), y entrena sobre un prefijo de 50 000 fotogramas. El repositorio se publica bajo licencia Apache 2.0 y ocupa 7,8 GB.

El modelo no es un modelo de lenguaje: es una política visomotora (vision-language-action) que recibe observaciones visuales y produce acciones de robot de siete dimensiones, incluido el control de la pinza. La innovación concreta de esta ficha es el esquema de ajuste: solo se entrenan 40 factores LoRA de rango 16 y alpha 16, mientras que las 51 hojas originales, los sesgos y las normas permanecen congelados, y no se aplica LoRA al bloque de lenguaje.

Su relevancia es acotada pero clara para investigación en robótica: demuestra que un ajuste paramétricamente eficiente sobre los módulos de visión, atención de acción, MLP y AdaRMS basta para alcanzar 1395/2000 (69,8 %) en la evaluación final de LIBERO, un resultado que el autor documenta con un protocolo de evaluación explícito (MuJoCo 3.2.3, envseed 7, batch 16, máximo 32 clientes, suite 8).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible de forma explicita; politica visomotora (VLA) de la familia pi05/openpi con encoder de vision, atencion de accion, MLP, AdaRMS y adaptadores LoRA acoplados |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de contexto textual; la ventana es de observaciones y pasos de accion) |
| Tipos de cuantizacion | inferencia en BF16; los adaptadores LoRA en crudo (sin EMA) se pliegan en FP32 antes de la inferencia en BF16 |
| Idiomas soportados | no disponible (modelo de robotica, sin interfaz de lenguaje natural declarada) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible; repositorio de 7,8 GB gestionado con la libreria `openpi` |

## Arquitectura y entrenamiento

La arquitectura subyacente es una politica visomotora de la familia pi05 servida mediante openpi. Los adaptadores LoRA se colocan en los modulos de atencion y MLP de la torre de vision, en el stem y la cabeza, en la atencion y el MLP de accion, en el modulo AdaRMS de accion y en las entradas/salidas de accion y de tiempo. La dimension 6 del modelo de dinamica inversa (IDM) de la pinza queda excluida del entrenamiento, mientras que se conservan las entradas y salidas de politica de siete dimensiones y el control de la pinza. No se aplica LoRA al bloque de lenguaje. De los 51 nodos hoja originales, todos permanecen congelados y solo 40 factores LoRA reciben gradiente.

El entrenamiento consiste en 10 000 actualizaciones frescas con batch 32, semilla 42, tasa de aprendizaje 1e-5, 500 pasos de warmup y media movil exponencial (EMA) con factor 0,999, partiendo de un prefijo de 50 000 fotogramas del punto de control objetivo `libero-support-random-waypoint-300k`. La validacion se realiza en bucle abierto sobre repeticiones fijas, al inicio y cada 1000 actualizaciones, sin que las etiquetas del experto entren nunca en los gradientes ni en la seleccion de modelo. La evaluacion es de tipo «final-only»: se informa unicamente del resultado del punto final, sin barrido de puntos de control intermedios.

## Capacidades

- Generacion de acciones de robot en siete dimensiones, incluyendo el control de la pinza, a partir de observaciones visuales.
- Manipulacion robótica en el entorno de simulacion LIBERO (suite 8 segun el protocolo de evaluacion).
- Procesamiento de multiples vistas de camara: la variante se denomina `all-view-medium`, e incluye adaptadores sobre stem, cabeza y modulos de atencion/MLP de vision.
- Prediccion de dinamica inversa (IDM) para la pinza, con la dimension 6 explicitamente excluida del ajuste.
- Condicionamiento temporal mediante AdaRMS y entradas/salidas de tiempo con adaptadores LoRA.
- Servicio en modo servidor con batch 16 y hasta 32 clientes concurrentes, segun el protocolo registrado.
- No se declara soporte de tool calling, function calling, agentes basados en lenguaje, capacidades multilingues ni generacion de texto.

## Casos de uso

- Investigacion en manipulación robótica: sirve como política de referencia para experimentar con tareas LIBERO en MuJoCo 3.2.3, usando la suite 8 y el protocolo de evaluacion documentado por el autor.
- Estudio de PEFT en modelos visomotores: al entrenar solo 40 factores LoRA con el resto de parametros congelados, es un banco de pruebas controlado para medir cuanto rendimiento aporta el ajuste eficiente en una politica VLA.
- Reproduccion de resultados: el autor fija commit de origen (`ea4f0bb2`), commit objetivo (`32ed215b`), semilla 42, batch 32, LR 1e-5, warmup 500 y EMA 0,999, lo que permite intentar replicar el 1395/2000 en LIBERO.
- Punto de partida para ajustes posteriores: al ser un adaptador sobre pi05, puede reutilizarse como inicializacion para afinados adicionales en otras variantes de vista o en otros prefijos de datos.
- Evaluacion comparativa de adaptadores: sirve como control frente a otras configuraciones de LoRA (por ejemplo, solo LLM frente a solo accion, o rangos distintos) para aislar la contribucion de los modulos de vision y de accion.
- Validacion de infraestructura de servicio: el escenario de servidor con batch 16, maximo 32 clientes y RNG compartido permite probar despliegues de inferencia concurrente para politicas de robot antes de trasladarlas a hardware fisico.
- Analisis de protocolos de evaluacion: al ser una evaluacion «final-only» con validacion en bucle abierto, es util para estudiar como la seleccion de modelo basada en validacion se correlaciona con el rendimiento final.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado | Protocolo |
|---|---|---|---|
| LIBERO (evaluacion final unica) | Tasa de exito | 1395/2000 (69,8 %) | MuJoCo 3.2.3, envseed 7, server batch 16, max 32 clientes, suite 8 |
| Validacion en bucle abierto (repeticion fija) | no disponible (no se publican cifras) | no disponible | Ejecutada al inicio y cada 1000 actualizaciones, sobre repeticiones fijas |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible. El unico dato cuantitativo es el 1395/2000 de la evaluacion final de LIBERO. El autor advierte que las diferencias de RNG compartido en el servidor y de forma de batch en BF16 siguen el protocolo registrado, lo que implica que variaciones en la infraestructura de servicio pueden alterar el resultado.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El repositorio ocupa 7,8 GB, un tamano superior al esperado para un adaptador LoRA de rango 16 sobre un modelo de pocos miles de millones de parametros, lo que sugiere que incluye pesos fusionados o artefactos adicionales. Como referencia, en BF16 harian falta al menos unos 8 GB solo para pesos, mas activaciones e inferencia del simulador.
- GPU recomendadas: no disponible. No se indica en la informacion proporcionada que GPU se uso para entrenar o evaluar.
- GPU de consumo: no disponible. No se puede confirmar si cabe en una RTX 4090 u otras GPU de consumo sin medir el consumo real del punto de control completo.
- Opciones de despliegue: libreria `openpi` (declarada como `library_name`), con soporte de modo servidor (batch 16, maximo 32 clientes). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a una politica visomotora.
- Entorno de simulacion: MuJoCo 3.2.3, con `envseed` 7 y la suite 8 de LIBERO.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Resultado en LIBERO | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| pi05-libero-support-lora16-all-view-medium (este modelo) | Adaptador LoRA rango 16 sobre pi05 | no disponible | no disponible | 1395/2000 (69,8 %) | apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| Donghyun1228/pi05-libero-support-probe-source-n50000-10000-20261015 | Punto de control fuente (commit `ea4f0bb2`) | no disponible | no disponible | no disponible | no disponible | Referenciado por el autor |
| Donghyun1228/libero-support-random-waypoint-300k-20261015 | Punto de control objetivo (commit `32ed215b`) | no disponible | no disponible | no disponible | no disponible | Referenciado por el autor |
| Alternativas de la misma categoria (otras politicas VLA para LIBERO) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos con otras politicas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Alcance muy restringido: es una politica especializada en LIBERO con variante de vista `all-view-medium`; no es un modelo de proposito general.
- Rendimiento no saturante: 1395/2000 implica un 30,2 % de fallos en la evaluacion final de LIBERO.
- Evaluacion «final-only»: no se publica el barrido de puntos de control intermedios ni la curva de validacion, por lo que no hay evidencia de que el punto final sea el mejor ni de que no exista sobreajuste al protocolo.
- Reproducibilidad fragil: el resultado depende de MuJoCo 3.2.3, `envseed` 7, batch de servidor 16, maximo 32 clientes, suite 8 y del RNG compartido del servicio; cambios en la forma del batch en BF16 pueden alterar la metrica.
- Seleccion de modelo sin etiquetas de experto: las etiquetas del experto no entran en gradientes ni en la seleccion de modelo, lo que limita la senal de validacion disponible.
- Adaptadores crudos sin EMA: los adaptadores LoRA en crudo (no EMA) se pliegan en FP32 antes de la inferencia en BF16; desplegar el artefacto sin respetar ese plegado puede degradar el comportamiento.
- Sin datos de sesgo: no se aporta informacion sobre sesgos de la politica, generalizacion fuera de distribucion ni robustez ante cambios de iluminacion, textura o posicion de camara.
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero si existe riesgo de acciones incorrectas o inseguras fuera del entorno de simulacion para el que fue ajustado.
- Uso comercial: la licencia declarada es Apache 2.0, lo que en principio permite uso comercial del artefacto, pero no se aclaran los terminos del modelo base pi05 ni de los puntos de control de origen y destino referenciados.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta; el repositorio se creo y actualizo el 2026-10-16, con un minuto de diferencia entre ambas marcas, lo que sugiere una publicacion automatizada y sin validacion externa.
- No hay tarjeta de modelo extensa: la model card se limita a una descripcion tecnica del entrenamiento y del protocolo, sin guia de uso, ejemplos de inferencia ni limitaciones declaradas por el autor.

## Enlaces

- HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-support-lora16-all-view-medium-n50000-10000-20261016
- Punto de control fuente citado en la model card: Donghyun1228/pi05-libero-support-probe-source-n50000-10000-20261015 (commit `ea4f0bb2001e12d701af8a294f91da437e857f55`)
- Punto de control objetivo citado en la model card: Donghyun1228/libero-support-random-waypoint-300k-20261015 (commit `32ed215baf01af7e82f927a62b108873aa70bd19`)
- Libreria declarada: `openpi` (stack de la familia pi05 referenciado en las etiquetas del repositorio)
- Nota sobre la busqueda web: los resultados devueltos por la busqueda no guardan relacion con el modelo (contenido para adultos de un sitio de videos) y no se ha encontrado ningun paper, blog, repositorio o demo adicional relevante. No se dispone de mas enlaces verificables.
