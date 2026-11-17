# iaac-maai/hackathon-team4-resplan-ae

## Resumen

ResPlan CVAE (modelo CVAE_z64) es un autoencoder variacional condicional (CVAE) entrenado sobre el conjunto de datos ResPlan, compuesto por aproximadamente 17.000 plantas de vivienda residencial. Lo desarrolla el equipo 4 del IAAC AI Architecture Hackathon 2026, y su proposito es aprender representaciones latentes compactas de la geometria de plantas residenciales para permitir exploracion generativa mediante interpolacion en el espacio latente. No es un modelo de lenguaje: es un modelo generativo visual especializado en dominios arquitectonicos.

El modelo codifica una representacion raster multicanal de la planta (14 canales de geometria a 64 x 64 pixeles) junto con tres caracteristicas numericas de condicionamiento (area neta, area y profundidad de muro) en un espacio latente de 64 dimensiones, y reconstruye la planta a partir de dicha representacion. Se distribuye exclusivamente en formato ONNX (2,32 M de parametros en la configuracion z64) y esta pensado para inferencia con ONNX Runtime.

Su relevancia es acotada pero clara: demuestra un flujo completo de investigacion aplicada en diseno computacional, desde la preparacion del dataset hasta el despliegue en un formato portable. El autor advierte explicitamente de que no es apto para produccion de planos de construccion, sino para exploracion de diseno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder variacional condicional (CVAE) con encoder convolucional, muestreo por reparametrizacion y decoder |
| Parametros totales | 2,32 M (configuracion CVAE_z64); 1,92 M (z32); 3,11 M (z128) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo visual, no de lenguaje) |
| Tipos de cuantizacion | No disponible; exportado en ONNX (FP32 por defecto) |
| Idiomas soportados | No disponible (no procesa texto) |
| Licencia | other (el autor remite a la licencia del dataset original; el repositorio ResPlan contiene declaraciones contradictorias) |
| Formato de pesos | ONNX (`resplan_cvae.onnx`) con `config.json` asociado |

Dimension del latente: 64. Entrada de geometria: `(batch, 14, 64, 64)`. Entrada de condicionamiento numerico: `(batch, 3)`. Salida: 14 canales a 64 x 64.

## Arquitectura y entrenamiento

El modelo es un CVAE compuesto por tres bloques: un encoder que procesa los 14 canales de geometria raster y las tres caracteristicas numericas de condicionamiento para producir una distribucion latente (media y varianza); una capa de reparametrizacion que muestrea vectores latentes durante el entrenamiento; y un decoder que, a partir del vector latente y de las caracteristicas de condicionamiento, reconstruye los 14 canales de la planta. El espacio latente elegido para el modelo publicado es de 64 dimensiones, seleccionado tras comparar tres configuraciones (32, 64 y 128) con la misma particion del dataset.

El entrenamiento se realizo sobre el dataset ResPlan, con unas 17.000 plantas residenciales representadas como rasters binarios de 64 x 64 pixeles en 14 canales (muro, puerta, ventana, puerta principal, dormitorio, bano, cocina, salon, interior, balcon, jardin, aparcamiento, piscina y terreno). La funcion objetivo combina perdida de reconstruccion y divergencia KL; el modelo z64 obtuvo el mejor objetivo de test (187,84) frente a z32 (205,52) y z128 (196,96), con divergencias KL de 15,88, 7,21 y 22,79 respectivamente. El autor no documenta el numero de tokens ni el desglose exacto del conjunto de entrenamiento, y la model card indica que el tiempo de entrenamiento y las puntuaciones de validacion no se han incorporado aun. No se menciona uso de RLHF, DPO ni tecnicas de decodificacion especulativa; no aplican en este dominio.

## Capacidades

- Reconstruccion de plantas residenciales: genera una representacion de 14 canales a 64 x 64 pixeles a partir de un vector latente y de las condiciones numericas de entrada.
- Codificacion en espacio latente: proyecta plantas en vectores de 64 dimensiones, utiles para busqueda de similitud o agrupamiento.
- Interpolacion latente (VAE blend): permite generar representaciones espaciales intermedias entre dos plantas dadas, lo que constituye el caso de uso principal declarado por el autor.
- Condicionamiento numerico: la generacion puede modularse mediante area neta, area y profundidad de muro.
- Inferencia portable: al estar exportado a ONNX, se ejecuta con ONNX Runtime en CPU o GPU sin dependencia de PyTorch.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues; no es un modelo de lenguaje.
- No soporta vision general ni audio: la entrada es una representacion raster especifica del dominio, no imagenes arbitrarias.

## Casos de uso

- Exploracion generativa de variantes de planta: dada una planta semilla, se codifica y se decodifica con perturbaciones del latente para obtener alternativas de distribucion espacial; util en fases tempranas de diseno donde se buscan configuraciones, no planos definitivos.
- Interpolacion entre dos plantas de referencia: el flujo de VAE blend genera estados intermedios que sirven como material de discusion en talleres de diseno participativo.
- Investigacion en codificacion latente de geometria arquitectonica: el espacio de 64 dimensiones puede analizarse con tecnicas de reduccion de dimensionalidad para estudiar que ejes del latente correlacionan con area, profundidad de muro o tipologia de estancias.
- Docencia en diseno computacional: el modelo, con 2,32 M de parametros y formato ONNX, es lo bastante ligero para ejecutarse en un portatil dentro de un cuaderno de ejercicios sobre modelos generativos.
- Prototipado de interfaces de diseno asistido: integracion en herramientas web o de escritorio mediante ONNX Runtime para ofrecer reconstruccion e interpolacion en tiempo de interaccion.
- Filtrado y agrupamiento previo de un corpus de plantas: el encoder permite proyectar las 17.000 plantas del dataset y detectar duplicados o clusters tipologicos antes de un analisis manual.

## Benchmarks y rendimiento

Los unicos resultados publicados son las metricas de test del propio autor, no comparables con benchmarks estandar de la comunidad (MMLU, HumanEval, GSM8K no aplican a este modelo).

| Modelo | Objetivo de test | Perdida de reconstruccion | Divergencia KL | Parametros |
|---|---:|---:|---:|---:|
| CVAE_z32 | 205,52 | 205,51 | 7,21 | 1,92 M |
| CVAE_z64 | 187,84 | 187,82 | 15,88 | 2,32 M |
| CVAE_z128 | 196,96 | 196,94 | 22,79 | 3,11 M |

No se han publicado resultados de validacion ni comparaciones con otros modelos de generacion de plantas en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 2,32 M de parametros en FP32 el peso del modelo ronda los 9 MB, y las activaciones a 64 x 64 x 14 canales son minimas.
- GPU recomendadas: cualquier GPU con soporte de ONNX Runtime (CUDA o TensorRT). No requiere A100 ni H100; una GPU integrada o una GTX 1650 son suficientes.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo e incluso en CPU.
- Opciones de despliegue: ONNX Runtime (via oficial), con posibilidad de ejecucion en CPU, CUDA o TensorRT; tambien puede integrarse en aplicaciones de escritorio o web mediante los bindings de ONNX Runtime.
- Latencia y throughput: no se han publicado mediciones. Por el tamano del modelo, la latencia esperada es de orden de milisegundos por lote en CPU moderna, pero se trata de una estimacion, no de un dato del autor.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada.

| Modelo | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| ResPlan CVAE_z64 | 2,32 M | 14 x 64 x 64 + 3 condiciones | other | ONNX en Hugging Face |
| Alternativas de generacion de plantas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es apto para produccion de planos de construccion; el autor lo restringe explicitamente a investigacion y exploracion de diseno.
- La reconstruccion es borrosa e incompleta en detalles geometricos finos, segun reconoce la propia model card.
- La resolucion de 64 x 64 pixeles limita gravemente la precision espacial: no captura dimensiones reales ni cotas.
- El condicionamiento se reduce a tres variables numericas (area neta, area, profundidad de muro); no acepta restricciones programaticas, normativas ni de orientacion.
- La licencia figura como "other" y el dataset original (ResPlan) contiene declaraciones de licencia contradictorias; antes de cualquier uso, incluido el comercial, debe consultarse a los mantenedores del dataset.
- No se han publicado sesgos conocidos, pero el modelo hereda los sesgos de la distribucion del dataset ResPlan, que no se detalla en la informacion disponible.
- Riesgo de alucinacion en sentido estricto no aplica; el equivalente es la generacion de geometrias plausibles pero no validas constructivamente.
- No se documentan tiempos de entrenamiento, particiones exactas del dataset ni puntuaciones de validacion, lo que dificulta la reproducibilidad.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso o validacion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iaac-maai/hackathon-team4-resplan-ae
- Repositorio del dataset ResPlan: https://github.com/m-agour/ResPlan
- No se han encontrado en la busqueda web papers, blogs, demos ni repositorios adicionales asociados al modelo.
