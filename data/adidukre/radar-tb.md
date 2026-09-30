# adidukre/radar-tb

## Resumen

RADAR-tb (identificador `adidukre/radar-tb`) es un repositorio de pesos publicado por el autor adidukre que contiene exclusivamente las cabezas de lectura (read-out heads) entrenadas para RADAR, la propuesta presentada a la Task 2 de TREAT-MMTB en MICCAI 2026. No se trata de un modelo completo: el encoder de visión permanece congelado y es `microsoft/rad-dino`, mientras que este repositorio solo aloja los clasificadores entrenados sobre las representaciones de dicho encoder.

El modelo aborda la detección de tuberculosis en radiografías de tórax (chest X-ray) mediante un enfoque de adaptación de dominio. El repositorio incluye varias familias de cabezas: cabezas sobre cortes de radiografía (plain y con aleatorización de estilo), cabezas adversarias de modalidad, cabezas adversarias condicionales (CDAN) y cabezas adversarias a 700 píxeles, cada una replicada con tres semillas (42, 1337 y 2024). También incluye un fichero de referencia (`polarity_ref.npy`) para detectar exportaciones con polaridad invertida.

Es relevante ahora porque la tuberculosis sigue siendo una causa mayor de mortalidad global y los modelos de cribado sobre radiografía de tórax necesitan robustez frente a cambios de dominio entre centros y equipos. El repositorio es de reciente creación, con 0 descargas y 0 likes en el momento de la consulta, y el tamaño total del repo es de 0,5 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabezas de clasificacion (read-out heads) sobre encoder de vision congelado `microsoft/rad-dino` |
| Parametros totales | no disponible (el repositorio solo contiene cabezas; no se declara el numero de parametros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen sin cuantizar, en formato `.pt`) |
| Idiomas soportados | no aplica (modelo de imagenologia medica) |
| Licencia | other (licencia personalizada; no se detallan sus terminos en la informacion disponible) |
| Formato de pesos | PyTorch (`.pt`) y NumPy (`.npy` para `polarity_ref.npy`) |

## Arquitectura y entrenamiento

El modelo sigue un esquema de transferencia con encoder congelado: las representaciones se extraen con `microsoft/rad-dino`, un encoder de vision para radiografia de torax, y sobre ellas se entrenan unicamente las cabezas de lectura. Este repositorio no contiene el encoder, solo las cabezas. La informacion disponible no detalla la dimension del embedding, el numero de parametros de cada cabeza ni la funcion de perdida empleada.

Las cabezas se organizan en cinco familias con tres semillas cada una: `dep_plain_seed{42,1337,2024}.pt` y `dep_aug_seed{42,1337,2024}.pt` (cabezas sobre cortes de radiografia, en version simple y con aleatorizacion de estilo), `adv_seed{42,1337,2024}.pt` (cabezas adversarias de modalidad), `cdan_seed{42,1337,2024}.pt` (cabezas adversarias condicionales, del ingles Conditional Domain Adversarial Network) y `hires_seed{42,1337,2024}.pt` (cabezas adversarias a 700 px). Esta variedad apunta a un entrenamiento orientado a la robustez frente al cambio de dominio mediante alineamiento adversario y aumento de estilo. No se especifican el numero de imagenes de entrenamiento, la composicion del dataset, ni si se aplicaron etapas de ajuste fino adicionales.

## Capacidades

- Clasificacion de radiografias de torax orientada a tuberculosis mediante cabezas de lectura sobre representaciones de RAD-DINO.
- Variantes de cabeza con distintas estrategias de robustez de dominio: simple, con aleatorizacion de estilo, adversaria de modalidad, adversaria condicional y a 700 px.
- Replicas multi-semilla (42, 1337, 2024) que permiten construir ensembles o estimar varianza entre entrenamientos.
- Deteccion de exportaciones con polaridad invertida mediante el embedding de referencia `polarity_ref.npy`.
- Ejecucion sobre un encoder congelado, lo que reduce el coste de entrenamiento e inferencia al no requerir retropropagacion sobre el encoder.
- No soporta generacion de texto, razonamiento, codigo ni matematicas.
- No dispone de tool calling ni function calling.
- No esta disenado para agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa lenguaje natural).
- No incorpora modo de pensamiento, vision general, audio ni otras modalidades fuera de la radiografia de torax.

## Casos de uso

- Cribado de tuberculosis en radiografia de torax: las cabezas clasifican imagenes procedentes de un encoder congelado y sirven como componente de un sistema de triaje que priorice casos sospechosos para lectura radiologica.
- Despliegue de bajo coste: al requerir solo las cabezas entrenadas y el encoder congelado, el pipeline evita reentrenar el backbone y reduce el tiempo de puesta en marcha en entornos con recursos limitados.
- Ensembles multi-semilla: las tres semillas por familia permiten promediar predicciones y analizar la estabilidad del modelo antes de llevarlo a produccion.
- Adaptacion a nuevos centros hospitalarios: las variantes adversarias de modalidad y condicionales (CDAN) estan pensadas para reducir la degradacion cuando cambian el equipo de rayos X o el protocolo de adquisicion.
- Auditoria de datos medicos: `polarity_ref.npy` permite detectar imagenes exportadas con polaridad invertida, un error habitual en conjuntos de radiografias y motivo frecuente de fallos silenciosos en inferencia.
- Investigacion en adaptacion de dominio: las cinco familias de cabezas ofrecen un banco de comparacion controlado para estudiar el efecto del aumento de estilo, el alineamiento adversario y la resolucion de entrada.
- Reproducibilidad academica: sirve como artefacto de pesos para reproducir los resultados declarados en la Task 2 de TREAT-MMTB (MICCAI 2026).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas (AUC, sensibilidad, especificidad ni ninguna otra) para ninguna de las familias de cabezas, y tampoco se aportan cifras de la Task 2 de TREAT-MMTB mas alla de la referencia al reto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio pesa 0,5 GB e incluye solo las cabezas; el consumo real dependera del encoder `microsoft/rad-dino` que se cargue por separado.
- GPU recomendadas: no disponible. Al tratarse de un encoder de vision congelado mas cabezas ligeras, es plausible que funcione en GPU de gama media o consumer, pero no hay confirmacion en la informacion proporcionada.
- Cabe en GPU consumer: no confirmado en la informacion disponible.
- Opciones de despliegue: los scripts oficiales del repositorio de codigo son `python scripts/prepare.py --weights-repo adidukre/radar-tb` y `python scripts/predict.py --input /path/to/images --output /path/to/output`. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye resultados comparativos con otros modelos de deteccion de tuberculosis en radiografia de torax, ni se detallan alternativas de la misma categoria con las que contrastar parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- No es un producto sanitario: no se declara validacion clinica, marcado CE ni autorizacion regulatoria de ningun tipo.
- Licencia `other`: se desconoce el texto exacto de la licencia, por lo que el uso comercial no puede darse por permitido sin revisar los terminos del repositorio y del encoder `microsoft/rad-dino`.
- Sesgos conocidos: no se documenta la composicion demografica ni la procedencia geografica de los datos de entrenamiento, lo que impide evaluar sesgos por poblacion, edad, sexo o etnia.
- Riesgo de falsos negativos: en un contexto de cribado, un error de clasificacion puede derivar en un caso de tuberculosis no derivado a confirmacion; se requiere supervision profesional.
- Limitaciones de dominio: aunque se incluyen cabezas adversarias y de aleatorizacion de estilo, no se aportan metricas que cuantifiquen la ganancia real frente al cambio de dominio.
- Dependencia del encoder externo: el repositorio no incluye `microsoft/rad-dino`; cualquier cambio de version o de preprocesado del encoder puede alterar las predicciones.
- Riesgo de polaridad invertida: es un fallo documentado hasta el punto de que se distribuye un fichero de referencia para detectarlo, lo que indica que el pipeline es sensible a este error.
- Sin datos de reproducibilidad: no se publican metricas, tamanos de dataset ni hiperparametros completos, y el repositorio tiene 0 descargas y 0 likes, por lo que no existe validacion independiente por parte de la comunidad.
- Caveat de formato: los pesos estan en `.pt` de PyTorch, lo que exige cargar objetos serializados; conviene verificar la procedencia antes de deserializar en produccion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/adidukre/radar-tb
- Codigo y uso: https://github.com/adinathdukre/radar-tb
- Encoder congelado (RAD-DINO): https://huggingface.co/microsoft/rad-dino
- Reto de referencia: MICCAI 2026 TREAT-MMTB, Task 2 (mencionado en la model card, sin enlace facilitado)
- Nota: los resultados de busqueda web devueltos no contenian enlaces relacionados con el modelo; correspondian a contenidos no relacionados (danza y coreografia).
