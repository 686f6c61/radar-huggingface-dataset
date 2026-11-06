# oteam/oinvfold-ligand

## Resumen

OInvFold-ligand es un modelo de asignación provisional de elementos atómicos para ligandos, desarrollado por el equipo autor de ODesign (Odin Zhang et al.) y reimplementado de forma no oficial por el equipo OFoldX (oteam). Dado un ligando con coordenadas fijas, el modelo predice el elemento químico de cada átomo mediante un grafo geométrico con paso de mensajes, produciendo una asignación ordenada de elementos. Es la variante específica para ligandos de la familia OInvFold, que también incluye checkpoints para proteínas, ADN y ARN.

El modelo forma parte del ecosistema ODesign, un "world model" para el diseño de interacciones biomoleculares presentado en el paper arXiv:2510.22304. Mientras que las variantes poliméricas generan secuencias de proteínas, ADN o ARN a partir de una estructura de backbone, esta variante se centra en la química de ligandos: asigna elementos a átomos observados, dejando sin resolver la topología de enlaces, las cargas formales y la identidad canónica del componente químico.

Con 6,44 millones de parámetros y una arquitectura de grafo geométrico de 12 bloques con tamaño oculto 128 y 4 cabezas de atención, es un modelo muy compacto orientado a tareas auxiliares dentro de pipelines de diseño molecular. Su relevancia radica en que cubre un hueco poco explorado: la anotación provisional de elementos en ligandos cuando solo se dispone de coordenadas, un paso previo habitual en flujos de diseño y análisis estructural.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de grafo geométrico con paso de mensajes (encoder de 12 bloques) |
| Parametros totales | 6.444.630 (6,429 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo sobre grafo, no secuencial) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo biológico, no lingüístico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |
| Hidden size | 128 |
| Bloques de encoder | 12 |
| Cabezas de atencion | 4 |
| Atomos virtuales | 32 |
| Clases de salida liberadas | 37 (elementos atómicos) |
| Libreria | ofoldx |
| Pipeline | other |

## Arquitectura y entrenamiento

OInvFold-ligand es un modelo de grafo geométrico que opera sobre las coordenadas atómicas de un ligando. La arquitectura consta de 12 bloques de encoder con tamaño oculto 128, 4 cabezas de atención y 32 átomos virtuales, y aplica corrupción de grafo en cada bloque del encoder durante el entrenamiento. El modelo predice, para cada átomo observado, una de las 37 clases de elementos químicos liberadas, manteniendo los identificadores y coordenadas originales de los átomos.

Los detalles de datos de entrenamiento (composición del dataset, número de estructuras, curación) no están especificados en la información disponible y remiten al paper de ODesign. La librería ofoldx expone operaciones diferenciables de `encode` y `forward`, y `OInvFoldLoss` proporciona verosimilitud negativa enmascarada para polímeros; sin embargo, el grafo de ligandos no dispone de interfaz de supervisión de identidad atómica objetivo, y la construcción del dataset y la orquestación completa del entrenamiento quedan a cargo de la aplicación de entrenamiento.

Es importante señalar una advertencia del propio autor de la reimplementación: OFoldX utiliza nodos globales virtuales basados en centroides con rotaciones y traslaciones relativas reales, mientras que la preparación de polímeros liberada proporciona características globales de identidad constante/cero. Esto altera las predicciones del checkpoint y la calidad de inferencia requiere una evaluación separada.

## Capacidades

- Asignación provisional de elementos atómicos a ligandos a partir de coordenadas fijas.
- Predicción de una de 37 clases de elementos químicos por átomo.
- Conservación de identificadores y coordenadas atómicas originales en la salida.
- Generación de probabilidades por átomo para cada asignación de elemento.
- Decodificación greedy (un candidato) o beam search (candidatos ordenados por rango) en las variantes poliméricas del pipeline.
- Ejecución por etapas con `prepare`, `forward` y `postprocess`.
- Integración en flujos de diseño biomolecular junto con las variantes de proteína, ADN y ARN.
- No resuelve topología de enlaces, cargas formales ni identidad canónica del componente químico.

## Casos de uso

- Anotación provisional de ligandos en estructuras cristalográficas: cuando se dispone de coordenadas de un ligando pero la asignación de elementos es ambigua o incompleta, el modelo predice el elemento de cada átomo para su posterior revisión manual.
- Preprocesamiento en pipelines de diseño molecular: la asignación de elementos sirve como paso previo antes de herramientas que requieren tipos atómicos definidos para calcular energía, docking o dinámica molecular.
- Curación de datasets estructurales: permite detectar y corregir asignaciones de elementos inconsistentes en grandes conjuntos de estructuras biológicas.
- Análisis de interacciones proteína-ligando: al etiquetar los átomos del ligando, facilita el estudio de contactos y patrones de unión en complejos estructurales.
- Flujos de diseño inverso combinados: junto con las variantes de proteína, ADN y ARN, permite abordar el diseño conjunto de polímeros y ligandos en un mismo entorno (ofoldx).
- Docencia y prototipado en bioinformática estructural: su tamaño reducido (6,4 M de parámetros) permite ejecutarlo en hardware modesto para experimentación y validación de conceptos.
- Integración en herramientas de quimioinformática: la salida con identificadores y probabilidades puede alimentar módulos posteriores de reconstrucción de topología o asignación de carga.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, del orden de cientos de MB o menos, dado el tamaño de 6,4 M de parámetros; no se dispone de cifras oficiales.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere A100 ni H100. Una RTX 4090 o incluso GPUs de gama baja son más que suficientes.
- Cabe en GPU consumer: sí, en cualquier GPU consumer con suficiente memoria para el grafo de entrada; también es viable en CPU para estructuras pequeñas.
- Opciones de despliegue: la librería `ofoldx` (instalable con `pip install ofoldx`) es la vía oficial; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; dependen del tamaño del grafo de ligando y del hardware.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de asignación de elementos atómicos para ligandos con características equiparables.

## Limitaciones y advertencias

- Implementación no oficial: la model card ha sido redactada por el equipo OFoldX, no por los autores originales de OInvFold.
- Cambio en las predicciones del checkpoint: el uso de nodos globales virtuales basados en centroides con rotaciones y traslaciones reales, frente a las características globales constantes/cero de la preparación original, altera las predicciones; la calidad de inferencia requiere evaluación separada.
- Salida incompleta: no resuelve topología de enlaces, cargas formales ni identidad canónica del componente químico; la asignación es explícitamente provisional.
- Sin interfaz de supervisión para ligandos: el grafo de ligandos carece de interfaz de supervisión de identidad atómica objetivo, lo que limita el reentrenamiento directo.
- Licencia AGPL-3.0: impone obligaciones de copyleft para uso en red y distribución; revisar compatibilidad antes de uso comercial o en productos propietarios.
- Riesgo de asignaciones erróneas: al ser un modelo probabilístico, puede producir elementos incorrectos en átomos con entornos químicos atípicos; se recomienda validación manual.
- Datos de entrenamiento no especificados en la información disponible; remiten al paper de ODesign.
- Sin datos de benchmarks ni evaluación de sesgos publicados en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/oteam/oinvfold-ligand
- Variante proteína: https://huggingface.co/oteam/oinvfold-protein
- Variante ADN: https://huggingface.co/oteam/oinvfold-dna
- Variante ARN: https://huggingface.co/oteam/oinvfold-rna
- Paper: https://arxiv.org/abs/2510.22304
- Código ofoldx: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/oinvfold
- Repositorio original ODesign: https://github.com/The-Institute-for-AI-Molecular-Design/ODesign
- Guía de pipelines: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/pipelines/README.md
- Documentación ofoldx: https://ofoldx.valtech.ai/
