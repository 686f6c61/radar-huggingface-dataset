# SiXa18/caustic-weights

## Resumen

CAUSTIC es un modelo de red neuronal de grafos equivariante (PaiNN) diseñado para predecir desplazamientos químicos (chemical shifts) de la cadena principal de proteínas (H, HA, N, CA, CB, C') a partir de su estructura tridimensional. Lo desarrolla Maximilian Zinke (SiXa18) y se distribuye como parte del paquete Python `caustic-nmr` (versión 0.4.0). El problema que resuelve es la predicción rápida y precisa de chemical shifts, una propiedad fundamental para la validación de estructuras, el refinamiento y la asignación de resonancias en espectroscopía de RMN.

El modelo consta de 741.024 parámetros y se distribuye en formato ONNX (opset 17), lo que permite su integración en pipelines de bioinformática estructural sin necesidad de un framework específico de deep learning. Incluye además un calibrador post-predicción (SA16 v2) que aplica correcciones globales por núcleo y modificadores específicos para cisteínas. Su relevancia actual radica en que ofrece una alternativa de código abierto y ligera a métodos basados en campos de fuerza o en modelos más pesados, con una licencia permisiva (CC BY 4.0) que facilita su uso en investigación y aplicaciones comerciales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PaiNN (equivariant graph neural network) |
| Parametros totales | 741.024 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de grafos, no de texto) |
| Tipos de cuantizacion | no disponible (formato ONNX estándar) |
| Idiomas soportados | no aplica (entrada: estructura 3D de proteína) |
| Licencia | CC BY 4.0 (pesos); código del paquete MIT |
| Formato de pesos | ONNX (opset 17) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura PaiNN (Polarizable Atom Interaction Neural Network), una red neuronal de grafos equivariante que procesa la estructura atómica de la proteína como un grafo donde los nodos son átomos y las aristas representan interacciones espaciales. La equivarianza rotacional es una propiedad clave: las predicciones son invariantes a la orientación de la molécula, lo que garantiza consistencia física. El modelo fue entrenado sobre estructuras experimentales vinculadas a BMRB (Biological Magnetic Resonance Bank) con un proceso de limpieza de ruido en las etiquetas agresivo para los carbonos. Los detalles completos de arquitectura, características y receta de entrenamiento se documentan en `docs/METHOD.md` del repositorio. No se especifica el número de tokens ni el dataset exacto en la información disponible, pero se indica que el protocolo de división y las licencias de los datos están en `docs/DATA.md`.

## Capacidades

- Predicción de desplazamientos químicos de la cadena principal de proteínas: H, HA, N, CA, CB y C'.
- Acepta estructuras en formato PDB, mmCIF y modelos de AlphaFold (detección automática con incertidumbres calibradas por pLDDT).
- Salida calibrada mediante un calibrador post-predicción (SA16 v2) que ajusta offsets globales por núcleo y aplica modificadores específicos para cisteínas.
- Integración directa en el paquete Python `caustic-nmr` (pip install caustic-nmr==0.4.0), que incluye los mismos pesos.
- Formato ONNX permite ejecución en múltiples backends (ONNX Runtime, etc.) sin dependencias de frameworks de deep learning específicos.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento conversacional.

## Casos de uso

- Validación de estructuras proteicas: dado un modelo 3D (experimental o predictivo), se pueden predecir los chemical shifts y compararlos con los valores experimentales de RMN para evaluar la calidad de la estructura.
- Refinamiento de estructuras: los chemical shifts predichos pueden usarse como restricciones en protocolos de refinamiento estructural (por ejemplo, en simulaciones de dinámica molecular o en métodos de optimización de estructura).
- Asignación de resonancias en RMN: las predicciones ayudan a guiar la asignación de picos en espectros de proteínas, reduciendo el trabajo manual.
- Análisis de modelos de AlphaFold: al aceptar modelos de AlphaFold y calibrar incertidumbres con pLDDT, permite evaluar la fiabilidad de las predicciones estructurales de AlphaFold en términos de chemical shifts.
- Integración en pipelines de biología estructural: al ser un paquete Python ligero con pesos en ONNX, puede incorporarse en flujos de trabajo automatizados de análisis de proteínas (por ejemplo, en servidores de predicción o herramientas de anotación).
- Educación e investigación metodológica: sirve como referencia para estudiar la aplicación de redes neuronales de grafos equivariantes a problemas de química estructural, y como base para desarrollar modelos similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que el protocolo y los números de evaluación están en `docs/BENCHMARKS.md` del repositorio de GitHub, pero no se proporcionan valores concretos en la documentación de HuggingFace. Se recomienda consultar dicho documento para obtener métricas de error (por ejemplo, RMSE o MAE por núcleo) y comparaciones con otros métodos.

## Requisitos de hardware

- El modelo es extremadamente ligero: el archivo ONNX pesa aproximadamente 3 MB (3.045.952 bytes), por lo que cabe en cualquier sistema con más de 10 MB de RAM.
- No requiere GPU para inferencia; una CPU moderna es suficiente para procesar proteínas de tamaño típico en segundos o menos.
- Para procesamiento por lotes de muchas estructuras, una GPU puede acelerar la inferencia, pero no es necesaria.
- Despliegue recomendado: ONNX Runtime (Python, C++, etc.) o el paquete `caustic-nmr` que ya lo integra.
- No se dispone de datos de latencia o throughput específicos, pero dado el tamaño del modelo, se espera una inferencia casi instantánea en hardware estándar.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de predicción de chemical shifts con arquitectura PaiNN y distribución en ONNX. Métodos alternativos como SHIFTX2, SPARTA+ o UCBShift-J son anteriores y no usan redes neuronales de grafos equivariantes, pero no se dispone de datos de comparación directa en esta documentación.

## Limitaciones y advertencias

- Modelo especializado: solo predice chemical shifts de la cadena principal (H, HA, N, CA, CB, C'); no cubre átomos de cadenas laterales ni otros núcleos (por ejemplo, 15N, 13C' en otros contextos).
- Dependencia de la calidad de la estructura de entrada: predicciones poco fiables si la estructura 3D es de baja calidad o contiene errores.
- El calibrador SA16 v2 es específico para ciertas condiciones experimentales; puede no ser óptimo para todos los conjuntos de datos.
- Licencia CC BY 4.0 para los pesos: requiere atribución al autor (Maximilian Zinke) en cualquier uso, incluido el comercial. El código del paquete es MIT, pero los pesos tienen condiciones adicionales.
- No es un modelo de lenguaje: no debe usarse para tareas de NLP, generación de texto o razonamiento general.
- La información sobre el entrenamiento (dataset exacto, número de estructuras, hiperparámetros) no está completa en la model card; se remite a los documentos del repositorio para detalles.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/SiXa18/caustic-weights
- Repositorio de GitHub (código y documentación): https://github.com/maxzinke/caustic-nmr
- Documento de método: https://github.com/maxzinke/caustic-nmr/blob/main/docs/METHOD.md
- Documento de datos: https://github.com/maxzinke/caustic-nmr/blob/main/docs/DATA.md
- Documento de benchmarks: https://github.com/maxzinke/caustic-nmr/blob/main/docs/BENCHMARKS.md
- Licencia de pesos: https://github.com/maxzinke/caustic-nmr/blob/main/LICENSE-WEIGHTS
- Archivo de citación: https://github.com/maxzinke/caustic-nmr/blob/main/CITATION.cff
- Space de demostración: https://huggingface.co/spaces/SiXa18/caustic
- Perfil del autor: https://huggingface.co/SiXa18
