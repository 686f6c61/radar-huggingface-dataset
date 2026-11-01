# oteam/pxdesign

## Resumen

PXDesign-d es un modelo de difusión all-atom para la generación de novo y condicionada por diana de esqueletos proteicos (protein backbone generation), desarrollado originalmente por ByteDance Research. La versión distribuida en este repositorio, `oteam/pxdesign`, es una implementación no oficial empaquetada por el equipo OFoldX para su uso dentro de la librería `ofoldx`, que expone el modelo como un pipeline de diseño de binders. Resuelve el problema de generar candidatos de proteínas que se unan a una diana concreta, integrando en un mismo flujo la generación de coordenadas, la asignación de secuencia y la evaluación estructural.

El modelo combina un denoiser de tokens y un codificador/decodificador de átomos, con un tamaño de single de 384, pair de 128, 16 bloques de denoiser y 4 bloques de encoder y decoder, sumando 139,028 millones de parámetros. Se entrenó con un objetivo EDM de denoising de coordenadas sobre estructuras del PDB hasta el 1 de mayo de 2021, junto con estructuras predichas de AlphaFold DB y MGnify, en dos etapas: primero monómeros y después complejos condicionados por diana.

El repositorio (2,9 GB, safetensors, librería `ofoldx`, licencia AGPL-3.0) ofrece tres variantes operativas: el backbone independiente, el flujo Preview (100 esqueletos por defecto con ProteinMPNN y dos evaluaciones AlphaFold 2) y el flujo Extended (500 esqueletos, enrutado Protenix sobre la diana completa, cribado en dos pasos y reruns de 20 transiciones de difusión). Es relevante ahora porque traslada a un pipeline reproducible y de código abierto una parte del flujo de PXDesign y de PXDesignBench, con cero descargas y cero likes en el momento de la ficha, lo que indica que su adopción es aún incipiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión all-atom con denoiser de tokens y encoder/decoder de átomos; objetivo EDM de denoising de coordenadas |
| Parametros totales | 139,028 M (PXDesign-d) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (single size 384, pair size 128 como dimensiones internas) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo biológico, no lingüístico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

PXDesign-d es un modelo de difusión all-atom para generar esqueletos proteicos condicionados por una diana. La especificación publicada indica single size 384, pair size 128, 16 bloques de token denoiser, 4 bloques de atom encoder y 4 bloques de atom decoder, con 139,028 M de parámetros. El entrenamiento usa un objetivo EDM (EDM coordinate-denoising objective) sobre coordenadas, lo que sitúa al modelo en la familia de los modelos de difusión geométrica para estructuras biomoleculares, no en la de los transformers de lenguaje.

Los datos de entrenamiento son estructuras del PDB con fecha de corte 1 de mayo de 2021, más estructuras predichas de AlphaFold DB y MGnify. El procedimiento es en dos etapas: una primera fase centrada en estructuras monoméricas y una segunda fase en complejos condicionados por diana. La implementación de OFoldX expone el denoiser diferenciable de un paso para entrenamiento y fine-tuning, pero no reproduce el pipeline de entrenamiento completo de PXDesign-d. El flujo completo de diseño asigna secuencia con ProteinMPNN, evalúa el complejo y el binder no unido con AlphaFold 2 y filtra y ordena los candidatos; la evaluación Extended añade Protenix base o Protenix mini condicionado por estructura, siguiendo la composición publicada de PXDesignBench.

## Capacidades

- Generación de esqueletos proteicos de novo, sin condicionamiento por diana.
- Generación de esqueletos condicionada por diana (target-conditioned binder design), con colocación explícita del binder y de los tramos de la diana mediante `from_binder`.
- Generación de coordenadas all-atom, incluyendo átomos pesados de la diana y selenio (Se/SE), preservando MSE en lugar de sustituirlo por MET.
- Asignación de secuencia sobre los esqueletos generados mediante ProteinMPNN dentro del pipeline Preview y Extended.
- Evaluación estructural del complejo y del binder no unido con AlphaFold 2.
- Evaluación extendida con Protenix base o Protenix mini condicionado por estructura, con enrutado sobre la diana completa.
- Cribado en dos pasos y reruns de 20 transiciones de difusión para los candidatos que superan el cribado básico.
- Llamada independiente al componente backbone mediante `PxDesignBackbonePipeline`, que devuelve estructuras en orden de generación sin asignación de secuencia ni evaluación.
- Exposición del denoiser diferenciable de un paso para entrenamiento y fine-tuning.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni multilingüismo.

## Casos de uso

- Diseño de binders contra una diana terapéutica concreta: se carga la estructura de la diana en formato CIF, se define la colocación del binder con `from_binder` y se ejecuta el pipeline en modo Preview para obtener 100 esqueletos con secuencia asignada y evaluación AlphaFold 2, lo que permite priorizar candidatos experimentales en una primera ronda.
- Cribado amplio de candidatos en modo Extended: con 500 esqueletos por defecto, enrutado Protenix sobre la diana completa y reruns de 20 transiciones para los candidatos que pasan el cribado, se obtiene un conjunto más fiable para decidir qué pocos candidatos llevar a ensayo.
- Generación de novo de esqueletos proteicos: usando `PxDesignBackbonePipeline` de forma independiente se generan estructuras en orden de generación sin evaluación, útiles para explorar el espacio de plegamientos antes de comprometer recursos de asignación de secuencia.
- Integración en flujos de diseño de proteínas con MSA: en modo Extended se puede aportar un MSA en formato A3M por entidad de la diana, lo que incorpora evidencia evolutiva al enrutado Protenix y mejora la evaluación de complejos.
- Fine-tuning del denoiser: al exponerse el denoiser diferenciable de un paso, un equipo puede adaptar el modelo a una familia de dianas concreta con datos propios, sin reimplementar el pipeline completo de PXDesign-d.
- Reproducción de evaluaciones tipo PXDesignBench: la composición de evaluación sigue la publicada en PXDesignBench, lo que permite comparar candidatos generados con métricas de complejo y de binder no unido de forma consistente.
- Docencia e investigación en generación geométrica de proteínas: el repositorio permite estudiar un flujo completo de difusión all-atom con asignación de secuencia y evaluación estructural en un único paquete instalable por pip.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 2,9 GB en safetensors y el modelo tiene 139,028 M de parámetros, pero no se documenta el pico de memoria durante la generación de coordenadas ni durante la evaluación con AlphaFold 2 o Protenix.
- GPU recomendadas: no disponible.
- Si cabe en consumer GPU: no disponible.
- Opciones de despliegue: la vía documentada es la librería `ofoldx` (`pip install ofoldx`) con `ofoldx.pipeline("design", model="oteam/pxdesign")`; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible. El flujo Preview genera 100 esqueletos por defecto y el Extended 500, con reruns de 20 transiciones de difusión para los candidatos que pasan el cribado, pero no se publican tiempos por candidato.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de otros modelos de generación de esqueletos proteicos comparables (por ejemplo, RFdiffusion u otros modelos de difusión para protein design), ni sus parámetros, contexto, rendimiento o licencia, por lo que no es posible construir una comparativa fiable sin inventar datos.

## Limitaciones y advertencias

- Implementación no oficial: la model card ha sido escrita por el equipo OFoldX, no por ByteDance Research, y el modelo distribuido aquí no es el oficial de `bytedance/PXDesign`.
- Dependencia de la librería `ofoldx`: el archivo de modelo requiere esta librería y su pipeline; no es un checkpoint utilizable de forma autónoma con otras herramientas.
- El pipeline de OFoldX no reproduce el entrenamiento completo de PXDesign-d; solo expone el denoiser diferenciable de un paso para entrenamiento y fine-tuning.
- La convención de entrada difiere de la del upstream: se preservan MSE y Se/SE en lugar de sustituir MSE por MET, lo que puede alterar la distribución de features del checkpoint; las máscaras de observación controlan la geometría utilizable sin cambiar la pertenencia química.
- Riesgo de alucinación estructural: al ser un modelo generativo de coordenadas, los esqueletos generados pueden ser geométricamente plausibles pero no validarse experimentalmente; la evaluación con AlphaFold 2 y Protenix es una aproximación computacional, no una confirmación de laboratorio.
- Sesgos de datos: el entrenamiento se limita a PDB hasta el 1 de mayo de 2021, AlphaFold DB y MGnify, lo que puede infrarepresentar familias proteicas poco presentes en esas fuentes o posteriores a la fecha de corte.
- Licencia AGPL-3.0: impone obligaciones de copyleft fuerte para uso en red y distribución; conviene revisar su compatibilidad antes de integrar el modelo en productos comerciales.
- Idiomas: no aplica, es un modelo biológico sin capacidades lingüísticas.
- Adopción mínima: cero descargas y cero likes en el momento de la ficha, sin resultados de benchmarks publicados, lo que limita la evidencia disponible sobre su rendimiento real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oteam/pxdesign
- Repositorio original de PXDesign (ByteDance): https://github.com/bytedance/PXDesign
- PXDesignBench: https://github.com/bytedance/PXDesignBench
- Código del modelo en OFoldX: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/pxdesign
- Guía de pipelines de OFoldX: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/pipelines/README.md
- Sitio de la librería ofoldx: https://ofoldx.valtech.ai/
- PDB: https://www.rcsb.org/
- AlphaFold DB: https://alphafold.ebi.ac.uk/
- MGnify: https://www.ebi.ac.uk/metagenomics/
