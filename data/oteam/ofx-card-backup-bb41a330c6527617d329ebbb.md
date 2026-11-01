# oteam/ofx-card-backup-bb41a330c6527617d329ebbb

## Resumen

Esta ficha describe un checkpoint de AlphaFold 2 publicado por el equipo OFoldX bajo el identificador `oteam/ofx-card-backup-bb41a330c6527617d329ebbb`. Se trata de una implementación no oficial del modelo de predicción de estructura de proteínas de DeepMind, empaquetada para la librería `ofoldx`. El modelo resuelve el problema de predecir la estructura tridimensional de una proteína a partir de su secuencia de aminoácidos, usando alineamientos múltiples de secuencias (MSA) y plantillas estructurales opcionales como condicionamiento.

La arquitectura es la del AlphaFold 2 original: un tronco Evoformer que actualiza conjuntamente las representaciones de MSA y de pares de residuos, seguido de un módulo estructural con atención de puntos invariante que predice marcos de cadena principal, ángulos de cadena lateral, coordenadas atómicas y valores de confianza. El checkpoint contiene 92.962.266 parámetros en formato safetensors, con un tamaño de repositorio de 0,4 GB.

Es relevante porque permite ejecutar el pipeline de AlphaFold 2 dentro del ecosistema `ofoldx`, con variantes para monómero, monómero con pTM/PAE, multímero y el protocolo de ensemble de cinco modelos de CASP14. La licencia es AGPL-3.0, lo que condiciona su uso en productos propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Evoformer (48 bloques) + 4 bloques extra-MSA + 8 bloques de estructura con invariant point attention |
| Parametros totales | 92.962.266 (92,96 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (MSA de 256 y representacion de pares de 128; single de 384) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo biologico, no linguistico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |
| Libreria | ofoldx |
| Pipeline | other (prediccion de estructura de proteinas) |
| Pasos de reciclado | 4 (monomero y monomero pTM); 21 (multimero) |
| Tamano del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de AlphaFold 2: un tronco Evoformer de 48 bloques que actualiza de forma conjunta las representaciones de MSA (tamano 256) y de pares de residuos (tamano 128), con 4 bloques adicionales de MSA y una representación single de tamano 384. Sobre el tronco se aplica un módulo estructural de 8 bloques basado en invariant point attention, que produce marcos de cadena principal, ángulos de cadena lateral, coordenadas atómicas y estimaciones de confianza (pLDDT y, en la variante pTM, también PAE y pTM). El número de pasos de reciclado es de 4 para las variantes de monómero y de 21 para la variante multímero.

La variante multímero (AlphaFold-Multimer) incorpora MSAs emparejados y características relativas entre cadenas para predecir complejos proteicos. El checkpoint aquí descrito corresponde a un backup de tarjeta del repositorio de OFoldX; la model card indica que es una implementación no oficial y remite al repositorio oficial `google-deepmind/alphafold`. No se proporcionan en la información disponible detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO (no aplicables en este dominio).

## Capacidades

- Predicción de estructura tridimensional de proteínas a partir de secuencia de aminoácidos, MSA y plantillas estructurales opcionales.
- Predicción de monómeros con puntuaciones de confianza pLDDT.
- Predicción de monómeros con pTM y PAE (variante `alphafold2-ptm`).
- Predicción de complejos proteicos multicadena mediante MSAs emparejados y características relativas entre cadenas (variante `alphafold2-multimer`).
- Protocolo de ensemble de cinco modelos con ocho ensembles de entrada por checkpoint, orientado a ranking de predicciones y relajación de la mejor estructura (variante `alphafold2-casp14`).
- Evaluación con conjetura inicial a partir de coordenadas existentes de un complejo objetivo-ligando (variante `alphafold2-initial-guess`, evaluador `model_1_ptm` usado por PXDesign).
- Generación de coordenadas atómicas, marcos de cadena principal y ángulos de cadena lateral.
- No soporta tool calling, function calling, agentes ni capacidades multilingües: es un modelo biológico, no un modelo de lenguaje.

## Casos de uso

- Predicción de estructura de proteínas monoméricas en pipelines de investigación: se carga la estructura de entrada con `read_structure`, se instancia el pipeline `fold` con `model="oteam/alphafold2"` y se obtienen coordenadas y valores de confianza para análisis posterior.
- Modelado de complejos proteicos: la variante `alphafold2-multimer` permite predecir la interfaz y la disposición relativa de cadenas en complejos, útil en estudios de interacciones proteína-proteína.
- Ranking de predicciones en entornos de validación tipo CASP: la variante `alphafold2-casp14` ejecuta cinco checkpoints con ocho ensembles de entrada cada uno y permite seleccionar la mejor estructura según pLDDT medio.
- Refinamiento estructural con relajación de Amber: el pipeline permite aplicar relajación sobre la mejor estructura (`models_to_relax="best"`) usando OpenMM y PDBFixer, útil para obtener geometrías más realistas antes de análisis de docking.
- Evaluación de diseños de binders: la variante `alphafold2-initial-guess` permite evaluar un complejo objetivo-binder usando sus coordenadas existentes como conjetura inicial, integrándose en flujos de diseño de proteínas.
- Anotación estructural en pipelines bioinformáticos: al ejecutarse sobre CPU o GPU mediante la librería `ofoldx`, puede incorporarse a flujos automatizados de anotación funcional o priorización de dianas terapéuticas.
- Docencia y reproducibilidad: al ser una implementación abierta con licencia AGPL-3.0, permite reproducir experimentos de predicción estructural en entornos académicos sin depender del repositorio oficial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El checkpoint pesa 0,4 GB en safetensors, pero el consumo real depende del tamano del MSA, la longitud de la secuencia y el número de reciclados.
- GPU recomendadas: no disponibles de forma explícita. El pipeline acepta el parámetro `platform` (por ejemplo, `"CPU"` en el ejemplo de CASP14), lo que indica soporte tanto de CPU como de GPU.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: librería `ofoldx` (instalable con `pip install ofoldx`); para relajación de Amber se requiere OpenMM y PDBFixer instalados en el mismo entorno (por ejemplo, vía conda-forge).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / MSA | Licencia | Disponibilidad |
|---|---|---|---|---|
| `oteam/ofx-card-backup-bb41a330c6527617d329ebbb` (este) | 92,96 M | MSA 256, pares 128, single 384 | AGPL-3.0 | HuggingFace, libreria `ofoldx` |
| `oteam/alphafold2` | 93,283 M | MSA 256, pares 128, single 384 | no disponible en la informacion | HuggingFace, libreria `ofoldx` |
| `oteam/alphafold2-ptm` | 93,292 M | MSA 256, pares 128, single 384 | no disponible en la informacion | HuggingFace, libreria `ofoldx` |
| `oteam/alphafold2-multimer` | 93,278 M | MSA 256, pares 128, single 384, 21 reciclados | no disponible en la informacion | HuggingFace, libreria `ofoldx` |

No se dispone de datos de rendimiento comparativo (pLDDT, TM-score, GDT) en la información proporcionada para establecer una comparación cuantitativa con alternativas como ESMFold, RoseTTAFold u OpenFold.

## Limitaciones y advertencias

- Implementación no oficial: la model card indica explícitamente que el equipo de AlphaFold 2 no escribió esta tarjeta y que el repositorio oficial es `google-deepmind/alphafold`. La fidelidad respecto al original debe validarse por el usuario.
- Licencia AGPL-3.0: el uso en productos o servicios en red puede obligar a liberar el código fuente derivado; revisar compatibilidad antes de uso comercial.
- Coordenadas no predichas: los átomos no predichos, incluidos ligandos, hidrógenos y el OXT terminal, tienen coordenadas no disponibles.
- Marco de coordenadas: cada predicción utiliza un nuevo marco de coordenadas, por lo que las comparaciones directas entre ejecuciones requieren alineamiento.
- Relajación de Amber: requiere OpenMM y PDBFixer, y solo funciona con un grafo proteico lineal estándar y cerrado; las coordenadas relajadas sustituyen a los metadatos experimentales.
- Dependencia de MSA y plantillas: la calidad de la predicción depende de la profundidad del MSA y de la disponibilidad de plantillas; no se documentan en la información disponible los umbrales mínimos.
- Sin datos de sesgo, alucinación o rendimiento multilingüe: no aplicables o no disponibles para este dominio.
- Sin benchmarks publicados en la información disponible: no es posible garantizar niveles de precisión concretos sin evaluación propia.

## Enlaces

- HuggingFace: https://huggingface.co/oteam/ofx-card-backup-bb41a330c6527617d329ebbb
- Variante monómero: https://huggingface.co/oteam/alphafold2
- Variante monómero con pTM: https://huggingface.co/oteam/alphafold2-ptm
- Variante multímero: https://huggingface.co/oteam/alphafold2-multimer
- Variante CASP14: https://huggingface.co/oteam/alphafold2-casp14
- Variante initial-guess: https://huggingface.co/oteam/alphafold2-initial-guess
- Código OFoldX: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/alphafold2
- Librería ofoldx: https://ofoldx.valtech.ai/
- Paper AlphaFold 2: https://doi.org/10.1038/s41586-021-03819-2
- Paper AlphaFold-Multimer: https://doi.org/10.1101/2021.10.04.463034
- Repositorio oficial: https://github.com/google-deepmind/alphafold
- OpenMM: https://docs.openmm.org/latest/userguide/application/01_getting_started.html
- PDBFixer: https://github.com/openmm/pdbfixer
