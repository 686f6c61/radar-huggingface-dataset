# oteam/boltz2-affinity

## Resumen

Boltz-2 es un modelo de predicción de estructura biomolecular y de afinidad de unión proteína-ligando desarrollado originalmente por Saro Passaro, Gabriele Corso, Jeremy Wohlwend y colaboradores (MIT, Recursion, entre otras instituciones). La variante `oteam/boltz2-affinity` es una implementación no oficial publicada por el equipo OFoldX que empaqueta el flujo compuesto de estructura y afinidad para complejos proteína-ligando. El modelo aborda dos problemas centrales en descubrimiento de fármacos: predecir la conformación tridimensional de un complejo y estimar su afinidad de unión con precisión útil para cribado virtual.

La arquitectura se basa en un trunk Pairformer reciclado con atención atómica, codificadores de plantillas y MSA, y difusión de coordenadas EDM para la generación de estructura. Sobre esa base se añade un modelo de afinidad separado con cabezas pairwise. El scorer de afinidad cuenta con 515,088 millones de parámetros, 64 bloques Pairformer, 8 bloques de confianza y 12 bloques de afinidad (8 + 4), con tamaño single de 384 y pair de 128 y 6 pasadas de trunk.

Es relevante ahora porque la predicción de afinidad de unión con precisión cercana a métodos de física computacional, pero con coste de inferencia mucho menor, es un cuello de botella histórico en el diseño de fármacos asistido por IA. La licencia AGPL-3.0 y la dependencia de la librería `ofoldx` condicionan su adopción en entornos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pairformer con atención atómica, codificadores de plantillas y MSA, difusión de coordenadas EDM y cabezas de afinidad pairwise |
| Parametros totales | 515,088 millones (variante affinity scorer); 506,762 millones (variante structure) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo biológico, no lingüístico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Boltz-2 emplea un trunk Pairformer reciclado con atención atómica, codificadores de plantillas y de MSA, y un módulo de difusión de coordenadas EDM para la predicción de estructura al-átomo. La variante de afinidad añade un modelo separado con cabezas pairwise que opera en dos etapas: primero predice y clasifica estructuras, y después remuestrea y puntúa el complejo seleccionado. La especificación técnica indica 64 bloques Pairformer, 8 bloques de confianza, 12 bloques de afinidad (8 + 4), tamaño single de 384, tamaño pair de 128 y 6 pasadas de trunk para el scorer de afinidad.

El entrenamiento descrito en el informe original usa estructuras PDB anteriores al 2023-06-01, datos de RMN, trayectorias de dinámica molecular, destilación de monómeros de AlphaFold 2 y destilación de complejos de Boltz-1. Los datos de afinidad provienen de PubChem, ChEMBL, BindingDB y fuentes de ensayo filtradas, con generación de decoys y filtrado por confianza estructural. Los objetivos de afinidad incluyen pérdidas Huber absolutas y de diferencia con trunk desconectado, junto con un objetivo binario focal para clasificación de binders. La implementación de OFoldX expone únicamente el objetivo de denoising de coordenadas y no reproduce el entrenamiento por etapas de confianza y afinidad ni los pipelines de datos y generación de decoys.

## Capacidades

- Predicción de estructura biomolecular al-átomo para proteínas, ARN, ADN y complejos proteína-ligando.
- Predicción de afinidad de unión proteína-ligando mediante un flujo de dos etapas (predicción y ranking de estructuras, remuestreo y puntuación).
- Predicción de confianza estructural asociada a las conformaciones generadas.
- Soporte de guiado físico durante el muestreo mediante potenciales geométricos y de van der Waals, requiriendo números atómicos conocidos y radios tabulados soportados.
- Flujo compuesto estructura-afinidad que selecciona la estructura de mayor confianza y la repuntúa con el modelo de afinidad.
- No dispone de capacidades de generación de texto, código, matemáticas, visión, tool calling ni razonamiento multi-step en el sentido de los modelos de lenguaje.

## Casos de uso

- Cribado virtual en descubrimiento de fármacos: el modelo puntúa la afinidad de complejos proteína-ligando tras predecir su estructura, lo que permite priorizar compuestos candidatos antes de ensayos experimentales y reducir el coste de validación in vitro.
- Repuntuación de poses de docking: partiendo de complejos generados por herramientas de docking clásico, el flujo de afinidad remuestrea y puntúa la estructura seleccionada, ofreciendo una estimación complementaria a las funciones de scoring empíricas.
- Predicción de estructura de complejos proteína-ligando para validación de hipótesis: el modelo genera conformaciones al-átomo con valores de confianza, útiles para inspeccionar interacciones en el sitio de unión antes de diseñar mutantes o análogos.
- Análisis de selectividad frente a dianas relacionadas: ejecutando el pipeline sobre complejos de un mismo ligando con distintas proteínas, se pueden comparar afinidades predichas y detectar riesgos de off-target en etapas tempranas.
- Modelado de complejos con ácidos nucleicos: la variante de estructura cubre ARN y ADN, lo que permite estudiar interacciones proteína-ácido nucleico y complejos mixtos en contextos de biología estructural.
- Integración en pipelines de diseño molecular generativo: el scorer de afinidad puede conectarse como módulo de evaluación en bucles de generación de moléculas, filtrando candidatos por afinidad predicha antes de síntesis.
- Docencia e investigación metodológica en biología computacional: al ser una implementación abierta bajo AGPL-3.0, permite reproducir experimentos y comparar contra el repositorio oficial de Boltz-2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El tamaño del repositorio es de 4.1 GB, lo que da una referencia del peso de los artefactos, pero no se detalla el consumo en ejecución.
- GPU recomendadas: no disponible. No se especifican modelos concretos (A100, H100, RTX 4090) en la documentación.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la única vía documentada es la librería `ofoldx` mediante `pip install ofoldx`, con pipelines `fold` y `score`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| oteam/boltz2-affinity | 515,088 M | no disponible | Estructura + afinidad proteína-ligando | AGPL-3.0 | HuggingFace (implementación no oficial) |
| oteam/boltz2 | 506,762 M | no disponible | Estructura y confianza biomolecular | AGPL-3.0 | HuggingFace (implementación no oficial) |
| Boltz-2 oficial (jwohlwend/boltz) | no disponible en la información | no disponible | Estructura + afinidad | no disponible en la información | GitHub oficial |
| AlphaFold 2 (referencia de destilación) | no disponible en la información | no disponible | Estructura de proteínas | no disponible en la información | no disponible |

## Limitaciones y advertencias

- Implementación no oficial: el equipo original de Boltz-2 no escribió esta model card ni validó necesariamente esta variante; los resultados pueden diferir del repositorio oficial.
- La implementación de OFoldX no reproduce el entrenamiento por etapas de confianza y afinidad ni los pipelines de datos y generación de decoys del modelo original, lo que puede afectar a la fidelidad de las predicciones de afinidad.
- El guiado físico requiere números atómicos conocidos y radios tabulados soportados; los elementos no soportados provocan errores. Una distribución suave de elementos no determina un radio único.
- Los potenciales empíricos de guiado orientan el muestreo y no establecen identidad ni validez química.
- Riesgo de alucinación estructural: las conformaciones generadas son predicciones, no observaciones, y deben validarse experimentalmente.
- Sesgos de los datos de entrenamiento: PDB anterior a 2023-06-01, PubChem, ChEMBL y BindingDB condicionan la cobertura química y biológica; ligandos o dianas poco representados pueden degradar la precisión.
- Licencia AGPL-3.0: impone obligaciones de copyleft sobre obras derivadas y el servicio en red, lo que restringe su uso en productos comerciales cerrados sin revisión legal.
- OFoldX no redistribuye los datasets de entrenamiento, lo que limita la reproducibilidad completa del entrenamiento.
- No se documentan límites de contexto, cuantización ni idiomas, por lo que no es posible evaluar su comportamiento en esos ejes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oteam/boltz2-affinity
- Variante de estructura: https://huggingface.co/oteam/boltz2
- Paper: https://doi.org/10.1101/2025.06.14.659707
- Repositorio oficial de Boltz-2: https://github.com/jwohlwend/boltz
- Código de OFoldX para Boltz-2: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/boltz2
- Guía de pipelines de OFoldX: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/pipelines/README.md
- Sitio de OFoldX: https://ofoldx.valtech.ai/
