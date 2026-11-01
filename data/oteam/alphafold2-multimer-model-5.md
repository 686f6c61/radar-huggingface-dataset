# oteam/alphafold2-multimer-model-5

## Resumen

AlphaFold 2 es un modelo de predicción de estructura de proteínas desarrollado originalmente por DeepMind (John Jumper et al.) y publicado en *Nature* en 2021. Esta ficha corresponde a `oteam/alphafold2-multimer-model-5`, una implementación **no oficial** del modelo AlphaFold-Multimer distribuida por el equipo OFoldX a través de la librería `ofoldx`. El modelo predice la estructura tridimensional de complejos proteicos multi-cadena a partir de secuencias de aminoácidos, alineamientos múltiples de secuencias (MSA) y plantillas estructurales opcionales.

La arquitectura combina un tronco Evoformer de 48 bloques que actualiza conjuntamente las representaciones de MSA y de pares de residuos, seguido de un módulo estructural de atención sobre puntos invariantes (invariant point attention) que predice marcos de cadena principal, ángulos de cadena lateral, coordenadas atómicas y valores de confianza (pLDDT, PAE, pTM). El modelo cuenta con 93.278.041 parámetros (93,278 M) y 21 pasos de reciclado, una configuración específica de la variante multimer.

Su relevancia radica en que permite predecir interacciones proteína-proteína con precisión cercana a la experimental, un problema central en biología estructural y diseño de fármacos. Al estar empaquetado en formato `safetensors` y ser consumible mediante la librería `ofoldx`, facilita su integración en pipelines bioinformáticos en Python sin depender del repositorio original de DeepMind.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con tronco Evoformer (48 bloques) + módulo estructural de invariant point attention (8 bloques) + 4 bloques extra-MSA |
| Parametros totales | 93.278.041 (93,278 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (MSA de 256 secuencias, representación de pares de 128, representación single de 384) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo biológico, no lingüístico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura AlphaFold-Multimer: un tronco Evoformer de 48 bloques que procesa simultáneamente la representación de alineamiento múltiple de secuencias (MSA, tamaño 256) y la representación de pares de residuos (pair, tamaño 128), con una representación single de tamaño 384. Sobre el tronco se aplica un módulo estructural de 8 bloques basado en invariant point attention, que genera marcos de referencia para la cadena principal y predice ángulos de cadena lateral y coordenadas atómicas. La variante multimer incorpora MSAs emparejados (paired MSAs) y características relativas entre cadenas para modelar complejos proteicos. El modelo realiza 21 pasos de reciclado, frente a los 4 de las variantes monómero.

Los detalles de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) no están disponibles en la información proporcionada. El modelo card remite a la sección de Training Details, que no se incluye en el extracto. La implementación es no oficial y ha sido adaptada por el equipo OFoldX; el repositorio original es `google-deepmind/alphafold`. La innovación técnica principal es el uso de attention sobre puntos invariantes para garantizar equivarianza a rotaciones y traslaciones en la predicción de coordenadas 3D, junto con el reciclado iterativo de la representación.

## Capacidades

- Predicción de estructura 3D de complejos proteicos multi-cadena a partir de secuencias de aminoácidos.
- Predicción de marcos de cadena principal, ángulos de cadena lateral y coordenadas atómicas.
- Estimación de confianza por residuo (pLDDT) y de confianza de la interfaz (PAE, pTM según la variante).
- Uso de alineamientos múltiples de secuencias (MSA) y plantillas estructurales opcionales como condicionamiento.
- Soporte de evaluación con ensemble de cinco modelos (variante CASP14) para ranking de predicciones y relajación con Amber.
- Evaluación de complejos target-binder usando coordenadas existentes como initial guess.
- No soporta tool calling, function calling, agentes ni capacidades multilingües (no es un modelo de lenguaje).
- No predice ligandos, hidrógenos ni OXT terminal (coordenadas no disponibles para estos átomos).

## Casos de uso

- **Predicción de estructura de complejos proteicos**: el modelo puede predecir la estructura 3D de un complejo multi-cadena a partir de sus secuencias y MSAs, adecuado para estudios de interacciones proteína-proteína en biología estructural.
- **Análisis de interfaces de unión**: gracias a la predicción de PAE y pTM, permite evaluar la confianza de la interfaz entre cadenas, útil en el diseño racional de fármacos que bloquean interacciones específicas.
- **Diseño de anticuerpos y binders**: la variante initial-guess permite evaluar complejos target-binder usando coordenadas existentes, integrándose en pipelines de diseño computacional de proteínas.
- **Validación de modelos experimentales**: las predicciones pueden compararse con estructuras obtenidas por cristalografía o crio-EM para validar hipótesis estructurales.
- **Anotación funcional de proteínas desconocidas**: la estructura predicha puede revelar dominios y motivos funcionales en proteínas sin homólogos caracterizados.
- **Screening de mutaciones**: al predecir estructuras de variantes mutantes, permite evaluar el impacto estructural de mutaciones en complejos proteicos.
- **Integración en pipelines bioinformáticos**: el uso de `ofoldx` y el formato `safetensors` facilita su despliegue en flujos de trabajo en Python con `pip install ofoldx`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El tamaño del repositorio es de 0,4 GB, lo que sugiere que los pesos caben en GPUs de consumo, pero el consumo de memoria durante la inferencia (MSAs, representaciones de pares y reciclado) no está documentado.
- GPU recomendadas: no disponible. El modelo card menciona ejecución en `platform="CPU"` para relajación con Amber, pero no especifica requisitos de GPU.
- Cabe en GPU de consumo: no disponible (el tamaño de pesos de 0,4 GB es compatible con GPUs consumer, pero el pico de memoria de inferencia no está documentado).
- Opciones de despliegue: librería `ofoldx` (instalable con `pip install ofoldx`). Requiere OpenMM y PDBFixer solo para relajación con Amber.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| oteam/alphafold2-multimer-model-5 | 93,278 M | No disponible | No disponible | AGPL-3.0 | HuggingFace (oteam) |
| oteam/alphafold2 | 93,283 M | No disponible | No disponible | AGPL-3.0 | HuggingFace (oteam) |
| oteam/alphafold2-ptm | 93,292 M | No disponible | No disponible | AGPL-3.0 | HuggingFace (oteam) |
| oteam/alphafold2-casp14 | No disponible | No disponible | No disponible | AGPL-3.0 | HuggingFace (oteam) |

Las variantes monómero (`alphafold2`, `alphafold2-ptm`) predicen estructuras de una sola cadena, mientras que esta variante multimer predice complejos multi-cadena con 21 pasos de reciclado frente a 4 de las monómero. No se dispone de datos de benchmarks comparativos en la información proporcionada.

## Limitaciones y advertencias

- **Implementación no oficial**: el modelo card indica explícitamente que es una implementación no oficial de AlphaFold 2; el equipo de DeepMind no escribió esta model card ni valida esta distribución.
- **Licencia AGPL-3.0**: licencia copyleft fuerte; el uso comercial requiere cumplir con las obligaciones de la AGPL, incluida la distribución del código fuente si se ofrece como servicio en red. Revisar implicaciones legales antes de uso en producción.
- **Riesgo de predicciones inexactas**: la confianza debe evaluarse mediante pLDDT, PAE y pTM; regiones de baja confianza pueden corresponder a desorden intrínseco o a limitaciones del modelo.
- **Átomos no predichos**: ligandos, hidrógenos y OXT terminal no tienen coordenadas disponibles.
- **Dependencia de MSAs**: la calidad de la predicción depende de la profundidad y calidad de los alineamientos múltiples de secuencias; secuencias con pocos homólogos pueden producir predicciones de baja confianza.
- **Sesgos conocidos**: no documentados en la información proporcionada.
- **Idiomas**: no aplica; el modelo no procesa lenguaje natural.
- **Restricciones de producción**: requiere la librería `ofoldx`; la relajación con Amber requiere OpenMM y PDBFixer instalados en el mismo entorno.

## Enlaces

- [HuggingFace: oteam/alphafold2-multimer-model-5](https://huggingface.co/oteam/alphafold2-multimer-model-5)
- [Paper AlphaFold 2 (Nature)](https://doi.org/10.1038/s41586-021-03819-2)
- [Paper AlphaFold-Multimer (bioRxiv)](https://doi.org/10.1101/2021.10.04.463034)
- [Repositorio oficial google-deepmind/alphafold](https://github.com/google-deepmind/alphafold)
- [Código OFoldX alphafold2](https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/alphafold2)
- [Librería ofoldx](https://ofoldx.valtech.ai/)
- [OpenMM](https://docs.openmm.org/latest/userguide/application/01_getting_started.html)
- [PDBFixer](https://github.com/openmm/pdbfixer)
- [Variante monómero oteam/alphafold2](https://huggingface.co/oteam/alphafold2)
- [Variante oteam/alphafold2-ptm](https://huggingface.co/oteam/alphafold2-ptm)
- [Variante oteam/alphafold2-multimer](https://huggingface.co/oteam/alphafold2-multimer)
- [Variante oteam/alphafold2-casp14](https://huggingface.co/oteam/alphafold2-casp14)
- [Variante oteam/alphafold2-initial-guess](https://huggingface.co/oteam/alphafold2-initial-guess)
