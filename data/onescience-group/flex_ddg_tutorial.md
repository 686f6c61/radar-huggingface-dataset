# OneScience-Group/flex_ddG_tutorial

## Resumen

Flex ddG es un flujo computacional basado en Rosetta para predecir el efecto de mutaciones en interfaces proteína-proteína y estimar el cambio en la energía libre de unión (ΔΔG). No es un modelo de red neuronal: utiliza la función de energía de Rosetta y el protocolo Backrub para muestrear conformaciones locales, reempaquetar cadenas laterales, minimizar la estructura y calcular energías de interfaz para el tipo silvestre y el mutante. El protocolo original fue desarrollado por el laboratorio de Kortemme (UCSF) y se publicó en 2018 en *J Phys Chem B* (DOI: 10.1021/acs.jpcb.7b11367). En HuggingFace aparece como un tutorial de OneScience-Group con licencia MIT para el repositorio, aunque la ejecución requiere una instalación separada de Rosetta bajo su propia licencia. Es relevante para ingeniería de proteínas, análisis de residuos hotspot y mutagénesis de saturación in silico, sin necesidad de GPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Flujo computacional basado en la función de energía de Rosetta y muestreo conformacional Backrub (no es una red neuronal) |
| Parámetros totales | No disponible (no aplica; no tiene pesos de red neuronal) |
| Parámetros activos | No disponible (no aplica; no es un modelo MoE) |
| Longitud de contexto | No disponible (no aplica; no es un modelo de lenguaje) |
| Tipos de cuantización | No disponible (no aplica; no hay pesos que cuantizar) |
| Idiomas soportados | en, zh (idiomas de la documentación del repositorio; el flujo no procesa lenguaje) |
| Licencia | MIT (para el repositorio tutorial); Rosetta requiere licencia separada de RosettaCommons |
| Formato de pesos | No disponible (no aplica; no se distribuyen pesos; requiere Rosetta instalado) |

## Arquitectura y entrenamiento

Flex ddG no se entrena en el sentido clásico de aprendizaje automático. Es un protocolo computacional que utiliza la función de energía de Rosetta y el algoritmo Backrub para muestrear conformaciones locales del esqueleto proteico. El flujo de trabajo toma como entrada un archivo PDB de un complejo proteico, información sobre las cadenas de la interfaz y un resfile de Rosetta que define las mutaciones. Para cada estado (tipo silvestre y mutante) se genera un conjunto de conformaciones mediante Backrub, se reempaquetan las cadenas laterales, se minimiza la estructura y se calculan las energías de interfaz. La diferencia entre ambos estados produce el valor de ΔΔG. No hay datos de entrenamiento ni tokens; el método se basa en principios fisicoquímicos y en el modelo de energía de Rosetta. El artículo de referencia es Barlow et al., 2018 (DOI: 10.1021/acs.jpcb.7b11367).

## Capacidades

- Predicción del efecto de mutaciones en interfaces proteína-proteína mediante el cálculo de ΔΔG.
- Análisis de residuos hotspot en la interfaz, evaluando el impacto de sustituciones en la estabilidad de la unión.
- Mutagénesis de saturación in silico: genera las 20 sustituciones de aminoácidos estándar en un sitio diana y calcula ΔΔG para cada una.
- Ingeniería de proteínas y optimización de interfaz, para seleccionar mutaciones que puedan reforzar o debilitar interacciones.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un LLM).
- Capacidades multilingües: no aplica; los idiomas en y zh corresponden a la documentación del repositorio.
- Capacidades especiales: no incluye visión, audio ni modo de pensamiento; es un flujo de cálculo científico por CPU.

## Casos de uso

- Predicción de mutaciones en interfaces proteína-proteína: se usa para estimar cómo una mutación puntual altera la afinidad de unión, por ejemplo en el diseño de variantes de proteínas terapéuticas. El flujo requiere el PDB del complejo, la definición de las cadenas de la interfaz y un resfile con la mutación.
- Análisis de residuos hotspot: permite identificar qué residuos de la interfaz contribuyen más a la energía de unión, orientando la mutagénesis experimental hacia posiciones críticas.
- Mutagénesis de saturación de sitio único: genera todas las sustituciones posibles en un residuo diana y calcula ΔΔG para cada una, facilitando la selección de candidatos para validación en laboratorio.
- Ingeniería de anticuerpos: optimización de la afinidad de un anticuerpo por su antígeno mediante mutaciones en la interfaz, eligiendo variantes con ΔΔG favorable antes de experimentos costosos.
- Diseño de proteínas para terapia: identificación de mutaciones que debiliten interacciones patológicas (por ejemplo, en dianas oncogénicas) preservando la estructura global del complejo.
- Screening previo a evolución dirigida: filtrado computacional de bibliotecas de mutantes para reducir el número de variantes a probar experimentalmente, ahorrando tiempo y recursos de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de precisión, velocidad ni comparativas con otros métodos. La validación del protocolo se describe en el artículo original (DOI: 10.1021/acs.jpcb.7b11367), pero no se proporcionan valores numéricos en la documentación de HuggingFace ni en los resultados de la búsqueda web.

## Requisitos de hardware

- No requiere GPU ni DCU: los cálculos centrales de Flex ddG son ejecutados por programas de Rosetta en CPU.
- Cada instancia de Rosetta consume aproximadamente 2 GB de memoria RAM; el nivel de concurrencia debe ajustarse según el número de núcleos de CPU y la memoria disponible del nodo.
- GPU recomendadas: no aplica; no se necesita aceleración gráfica.
- ¿Cabe en GPU de consumo? No aplica; no utiliza GPU.
- Opciones de despliegue: ejecución local con Python (scripts oficiales) y Rosetta instalado; también se puede utilizar el entorno OneCode de OneScience para programación AI4S. No se mencionan vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible; no se han publicado mediciones en la información proporcionada.

## Comparativa con modelos similares

No se dispone de especificaciones de modelos comparables en la información proporcionada. Flex ddG pertenece a la familia de protocolos Rosetta para predicción de ΔΔG; existen alternativas como FoldX (fuerza empírica) o DeepDDG (red neuronal), pero no se han proporcionado datos de parámetros, contexto ni rendimiento para establecer una comparación cuantitativa. La siguiente tabla refleja la información disponible:

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Flex ddG (este) | Flujo Rosetta (energía + Backrub) | No aplica | No aplica | MIT (tutorial) + Rosetta (separada) | HuggingFace y GitHub |
| FoldX | Fuerza empírica | No disponible | No aplica | No disponible | No disponible |
| DeepDDG | Red neuronal | No disponible | No aplica | No disponible | No disponible |

## Limitaciones y advertencias

- No es un modelo de IA generativa: no procesa texto, no genera respuestas y no tiene pesos de red neuronal. El repositorio de HuggingFace tiene un tamaño de 0.0 GB, lo que confirma que no contiene pesos ni datasets.
- Requiere Rosetta instalado por separado. La licencia MIT del tutorial no cubre Rosetta; el uso comercial requiere una licencia comercial de RosettaCommons, mientras que académicos y usuarios no comerciales pueden solicitar una licencia no comercial.
- La precisión de los resultados depende de la calidad de la estructura de entrada (PDB), de la correcta definición de las cadenas de la interfaz y de la configuración del resfile. El propio README indica que el resfile debe comenzar con `NATAA`, no con `NATRO`.
- Los parámetros por defecto del tutorial están pensados para verificación funcional rápida, no para cálculos científicos de producción. Es necesario ajustar los parámetros para estudios rigurosos.
- El coste computacional puede ser elevado en CPU: cada instancia de Rosetta ocupa unos 2 GB de RAM y el flujo lanza múltiples instancias concurrentes mediante `multiprocessing`.
- No se han publicado benchmarks en la información disponible; los resultados de ΔΔG deben validarse experimentalmente antes de su uso en contextos de decisión.
- El README del repositorio muestra el comando `hf download OneScience-Group/flex_ddG`, mientras que el identificador real en HuggingFace es `OneScience-Group/flex_ddG_tutorial`. Esta discrepancia puede causar errores al descargar el paquete.
- Limitaciones de idioma: la documentación está disponible en inglés y chino; no hay versión en español. El flujo en sí no tiene restricciones de idioma porque no procesa lenguaje.

## Enlaces

- HuggingFace: https://huggingface.co/OneScience-Group/flex_ddG_tutorial
- GitHub (Kortemme-Lab): https://github.com/Kortemme-Lab/flex_ddG_tutorial
- GitHub (fork YumizSui): https://github.com/YumizSui/flex_ddG
- Artículo original: https://doi.org/10.1021/acs.jpcb.7b11367
- RosettaCommons (licencia e instalación): https://www.rosettacommons.org/software
- Entorno OneCode: https://web-2069360198568017922-iaaj.ksai.scnet.cn:58043/home
