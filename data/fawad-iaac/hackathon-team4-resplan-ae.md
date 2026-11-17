# fawad-iaac/hackathon-team4-resplan-ae

## Resumen

ResPlan CVAE es un autoencoder variacional condicional (CVAE) entrenado para generar y reconstruir plantas de vivienda residencial a partir del dataset ResPlan. Lo desarrolla el equipo 4 del IAAC AI Architecture Hackathon 2026, y su objetivo es explorar como la IA generativa puede asistir en la exploracion de diseno arquitectonico aprendiendo configuraciones espaciales de plantas residenciales. El modelo esta disponible unicamente en formato ONNX (2,32 M de parametros en la variante seleccionada CVAE_z64) y no es un modelo de lenguaje: no procesa texto ni mantiene conversaciones.

La arquitectura es un CVAE que codifica una representacion raster multicanal de la planta (14 canales de geometria a 64x64 pixeles) junto con tres caracteristicas numericas de condicionamiento (area neta, area y profundidad de muro) en un espacio latente de 64 dimensiones, y la reconstruye mediante un decodificador. El caso de uso elegido por los autores es la interpolacion latente entre dos plantas para generar representaciones espaciales intermedias.

Es relevante en el contexto de la investigacion en diseno generativo arquitectonico, no en el de modelos fundacionales: su tamano es minimo, su resolucion es baja (64x64) y los propios autores advierten que esta pensado para exploracion de diseno, no para produccion de planos listos para construccion. La model card esta incompleta en varios apartados (licencia, idiomas, resultados de validacion, tiempo de entrenamiento).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conditional Variational Autoencoder (CVAE) |
| Parametros totales | 2,32 M (variante CVAE_z64); 1,92 M (z32); 3,11 M (z128) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | other (declaracion no estandar; el dataset upstream tiene declaraciones conflictivas) |
| Formato de pesos | ONNX (exportado desde PyTorch) |
| Dimension latente | 64 |
| Entrada de geometria | `(batch, 14, 64, 64)` |
| Entrada de condicionamiento | `(batch, 3)` |
| Salida | 14 canales a 64x64 |
| Libreria de inferencia | onnxruntime |

## Arquitectura y entrenamiento

El modelo es un autoencoder variacional condicional con cuatro componentes: un codificador que procesa la representacion multicanal de la planta y las caracteristicas de condicionamiento para aprender una distribucion latente; una representacion latente de 64 dimensiones; una reparametrizacion que muestrea vectores latentes durante el entrenamiento; y un decodificador que usa la representacion latente junto con las condiciones numericas para reconstruir los canales de la planta.

Los datos de entrenamiento provienen del dataset ResPlan, con aproximadamente 17.000 plantas residenciales. Cada planta se rasteriza en 14 canales binarios (muro, puerta, ventana, puerta de entrada, dormitorio, bano, cocina, salon, interior, balcon, jardin, parking, piscina y terreno) a 64x64 pixeles, y se acompana de tres caracteristicas numericas escaladas: area neta, area y profundidad de muro. Se entrenaron tres configuraciones con el mismo split de datos (z32, z64 y z128); la z64 obtuvo el menor objetivo de test reportado (187,84), frente a 205,52 de z32 y 196,96 de z128. No se especifican en la informacion disponible el numero de tokens, la composicion exacta del dataset, ni si hubo tecnicas de alineacion como RLHF o DPO (no aplicables a este tipo de modelo).

## Capacidades

- Reconstruccion de representaciones de plantas residenciales en 14 canales a 64x64 pixeles.
- Aprendizaje y exploracion de patrones espaciales en distribuciones de vivienda.
- Interpolacion en el espacio latente entre dos plantas para generar representaciones espaciales intermedias (caso de uso principal declarado).
- Condicionamiento numerico sobre area neta, area y profundidad de muro.
- Exportacion a ONNX para inferencia con ONNX Runtime.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling, agentes ni capacidades multilingues.

## Casos de uso

- Exploracion de diseno arquitectonico: el modelo permite interpolar entre dos plantas residenciales existentes para generar variantes intermedias que sirvan como punto de partida en el proceso creativo, aprovechando el espacio latente de 64 dimensiones.
- Investigacion en diseno generativo: sirve como banco de pruebas academico para estudiar como los CVAE capturan patrones espaciales en distribuciones de vivienda, con tres configuraciones latentes comparables (z32, z64, z128).
- Docencia en arquitectura computacional: estudiantes pueden ejecutar el modelo ONNX con los ejemplos incluidos en el repositorio para comprender el funcionamiento de un VAE condicional aplicado a geometria.
- Analisis de distribucion espacial: la reconstruccion de plantas permite estudiar que elementos (muros, habitaciones, balcones) se preservan mejor y cuales se pierden, informando sobre la estructura latente aprendida.
- Prototipado rapido de layouts: dado que el modelo es de 2,32 M de parametros y se ejecuta en ONNX Runtime, puede integrarse en herramientas de diseno para generar borradores de baja resolucion (64x64) sin infraestructura GPU.
- Comparacion de arquitecturas generativas: los tres modelos entrenados con el mismo split permiten evaluar el compromiso entre dimension latente, perdida de reconstruccion y divergencia KL en tareas de generacion de plantas.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre el conjunto de test (objetivo de test, perdida de reconstruccion y divergencia KL):

| Modelo | Dimension latente | Parametros | Objetivo test | Perdida reconstruccion | KL divergence |
|---|---:|---:|---:|---:|---:|
| CVAE_z32 | 32 | 1,92 M | 205,52 | 205,51 | 7,21 |
| CVAE_z64 | 64 | 2,32 M | **187,84** | **187,82** | 15,88 |
| CVAE_z128 | 128 | 3,11 M | 196,96 | 196,94 | 22,79 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que no son aplicables a este tipo de modelo. Tampoco se incluyen tiempos de entrenamiento ni puntuaciones de validacion.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el modelo tiene 2,32 M de parametros y procesa tensores de `(batch, 14, 64, 64)`.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100. El modelo puede ejecutarse en CPU sin problema.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en entornos sin GPU mediante ONNX Runtime en CPU.
- Opciones de despliegue: ONNX Runtime (libreria declarada), con posibilidad de ejecucion en CPU o GPU segun los execution providers configurados.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo se espera latencia de milisegundos en hardware moderno, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la busqueda proporcionada. Como referencia interna, las tres configuraciones del propio proyecto se comparan en la seccion de benchmarks (CVAE_z32, CVAE_z64 y CVAE_z128). No se identifican alternativas externas de CVAE para generacion de plantas residenciales con datos verificables en la informacion disponible.

## Limitaciones y advertencias

- El modelo esta declarado explicitamente por los autores como herramienta de exploracion de diseno, no para produccion de planos listos para construccion.
- La resolucion de salida es muy baja (64x64 pixeles), por lo que los detalles geometricos finos aparecen borrosos o incompletos, segun la propia model card.
- La licencia es "other" y el dataset upstream ResPlan contiene declaraciones de licencia conflictivas; debe consultarse a los mantenedores antes de asumir cualquier licencia de codigo abierto o uso comercial.
- No es un modelo de lenguaje: no soporta texto, razonamiento, codigo, tool calling ni agentes; cualquier expectativa en ese sentido es erronea.
- La model card esta incompleta: faltan resultados de validacion, tiempos de entrenamiento, idiomas (no aplica) y detalles de cuantizacion.
- Riesgo de sesgo: el dataset se limita a plantas residenciales de una distribucion concreta; el modelo reproducira los patrones espaciales presentes en esos datos y no generalizara necesariamente a otras tipologias o culturas constructivas.
- Riesgo de alucinacion en sentido generativo: las interpolaciones latentes pueden producir configuraciones espaciales no validas arquitectonicamente, que deben revisarse siempre por un profesional.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/fawad-iaac/hackathon-team4-resplan-ae
- Repositorio del dataset ResPlan: https://github.com/m-agour/ResPlan
- No se han encontrado en la busqueda web papers, blogs, demos ni otros repositorios adicionales asociados al modelo.
