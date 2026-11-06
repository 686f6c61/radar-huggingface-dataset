# danielsaldana/AFCI_part6

## Resumen

`danielsaldana/AFCI_part6` no es un modelo de lenguaje ni una red neuronal entrenada: es el sexto lote de un kit de desarrollo offline para un sistema de deteccion de arcos electricos (AFCI, *arc-fault circuit interrupter*) orientado a la prevencion de incendios electricos. El repositorio contiene documentacion, articulos academicos, disenos de referencia de fabricantes, normativa industrial y estadisticas de incendios, empaquetados para consulta sin conexion en un PC con Windows 10/11 x64.

El sistema completo que documenta este kit se describe como una cadena de adquisicion y clasificacion: sensor de corriente, conversion analogico-digital mediante ADC y DMA de un STM32F407, extraccion de caracteristicas por FFT/STFT y una red neuronal profunda cuantizada que decide el disparo del interruptor. El entrenamiento se plantea en CPU, sin GPU, lo que situa el proyecto en el ambito de TinyML industrial.

La relevancia de este lote es documental, no de modelado: agrupa 41 articulos y tesis de acceso abierto, disenos de referencia de Texas Instruments (TIDA-010971, SDAA252), manuales de Arm Cortex-M4, guias de ABB, Siemens, Schneider y BEAMA, estadisticas de NFPA y CPSC, e informes de Sandia y OSTI. El repositorio pesa 278,1 MB repartidos en 80 archivos, con los archivos grandes troceados en partes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no contiene pesos de modelo; documenta una cadena sensor -> STM32F407 ADC+DMA -> FFT/STFT -> DNN cuantizada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el sistema objetivo usa una DNN cuantizada, sin especificar esquema) |
| Idiomas soportados | no disponible (documentacion en ingles, con algunos documentos en aleman) |
| Licencia | other |
| Formato de pesos | no disponible (el repositorio contiene PDF, Markdown, JSON y scripts `.ps1`/`.sh`) |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura de red neuronal propia. Documenta un pipeline de inferencia embebida cuyo objetivo es ejecutarse en un STM32F407 (nucleo Arm Cortex-M4) con adquisicion por ADC y DMA, calculo de caracteristicas en frecuencia mediante FFT y STFT, y clasificacion con una red neuronal profunda cuantizada. El material de referencia cubre arquitecturas ligeras candidatas: CNN de bajo coste, mecanismos de atencion, hbridos CNN-Transformer, ShuffleNet, LSTM, fusion multi-caracteristica y transformadas aprendibles de FFT y wavelet (trabajos de 2026), ademas de Arc-FaultNet (2026).

No se proporcionan datos sobre volumen de entrenamiento, composicion del dataset, ni uso de RLHF o DPO, ya que no hay un modelo entrenado en este lote. La parte de entrenamiento se describe a nivel de sistema: Python en CPU sobre Windows, con el conjunto de herramientas ST Edge AI Core y Cube AI Studio para la conversion y el despliegue en el microcontrolador. Los scripts `join_parts.ps1` y `join_parts.sh` reconstruyen los archivos troceados y verifican su integridad contra `SHA256SUMS.txt`.

## Capacidades

- Consulta offline de 41 articulos y tesis sobre deteccion de arcos electricos en corriente alterna y continua, incluidos casos fotovoltaicos.
- Acceso a disenos de referencia de Texas Instruments para deteccion de arcos con IA en el borde (TIDA-010971, SDAA252, SBAA773, TIDA-010955, TIDA-010231).
- Documentacion de la familia MSPM0G5187 (datasheet, manual tecnico y guia de LaunchPad).
- Guia generica de dispositivos Arm Cortex-M4 (DUI0553 rev A y B) como sustituto del manual PM0214 de ST.
- Material de industria AFDD/AFCI de ABB, Siemens, Schneider, BEAMA, Leviton, NEMA y UL.
- Estadisticas de incendios electricos residenciales de NFPA y estimaciones de perdidas de CPSC.
- Informes gubernamentales y de laboratorio de Sandia/OSTI y CPSC/UL sobre pruebas de AFCI, disparos no deseados, comparativa FFT frente a wavelet y evaluacion de algoritmos.
- Indice maestro de las 15 partes del kit, orden de instalacion y listado de elementos ausentes.
- Lista de descargas manuales obligatorias de ST (STM32CubeIDE, CubeMX, CubeProgrammer, driver ST-LINK, ST Edge AI Core, Cube AI Studio, STM32CubeF4, DS8626, RM0090, PM0214, ES0182, UM1725, UM2526 y notas de aplicacion de ADC/DMA/DSP).
- Inventario de enlaces no incluidos: normas de pago (IEC 62606, UL 1699), datasets con registro previo y articulos no descargables.

## Casos de uso

- Formacion de ingenieros en proteccion electrica: el lote permite estudiar el estado del arte en deteccion de arcos sin conexion, partiendo de la revision de arXiv de 2023 y las tesis doctorales de UNC Charlotte (2024), CTU Prague y Waterloo, con las fuentes primarias a mano.
- Diseno de un prototipo AFCI embebido: los disenos TIDA-010971 y SDAA252 sirven como referencia directa de esquema, seleccion de componentes y flujo de IA en el borde para un detector de arcos en corriente alterna sobre MSPM0.
- Seleccion de arquitectura de red para microcontrolador: la carpeta de articulos compara CNN ligeras, ShuffleNet, LSTM y modelos con atencion, lo que permite acotar el coste computacional antes de comprometerse con una implementacion en Cortex-M4.
- Justificacion normativa y de mercado: las guias de ABB, Siemens, Schneider y BEAMA, junto con el articulo de UL, permiten documentar requisitos de producto, ensayos y comportamiento frente a disparos no deseados.
- Analisis de riesgo e impacto: las estadisticas de NFPA y CPSC y los informes de Sandia aportan cifras de incendios electricos residenciales y resultados de ensayos con productos listados UL 1699B, utiles para memorias tecnicas y propuestas.
- Preparacion de un entorno de desarrollo aislado: la checklist de descargas de ST y el indice maestro permiten montar un PC de trabajo offline con todas las herramientas y manuales necesarios, sin dependencia de red.
- Estudio comparativo de metodos de extraccion de caracteristicas: los trabajos sobre FFT frente a descomposicion wavelet, VMD y entropia multi-escala permiten evaluar alternativas al preprocesado frecuencial antes de fijar el pipeline de caracteristicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio es un compendio documental y no incluye metricas propias de un modelo entrenado.

## Requisitos de hardware

- No se requieren GPU: el kit esta pensado para entrenamiento en CPU sobre Windows 10/11 x64.
- Espacio en disco: 278,1 MB para el repositorio completo, mas el espacio de los archivos reconstruidos tras ejecutar los scripts de union.
- Memoria RAM: no disponible; el material son documentos PDF y Markdown, por lo que cualquier equipo ofimatico moderno es suficiente.
- Hardware objetivo del sistema descrito: STM32F407 con ADC y DMA, y como alternativa la familia MSPM0G5187 con aceleracion de IA en el borde.
- Herramientas de despliegue previstas: STM32CubeIDE, STM32CubeMX, STM32CubeProgrammer, ST Edge AI Core y Cube AI Studio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Repositorio | Tipo de contenido | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| danielsaldana/AFCI_part6 | Documentacion, articulos y disenos de referencia | Deteccion de arcos electricos y prevencion de incendios | other | Hugging Face, 0 descargas |
| danielsaldana/AFCI_part1 … AFCI_part15 | Resto de lotes del mismo kit | Particiones del mismo proyecto | other | Hugging Face |
| TIDA-010971 (Texas Instruments) | Diseno de referencia de hardware y firmware | Deteccion de arcos en CA con IA en el borde | Documentacion de TI, sujeta a sus terminos | Incluido en este lote y en el sitio de TI |
| SDAA252 (Texas Instruments) | Nota de aplicacion | Deteccion de arcos en CA con IA en el borde sobre MSPM0 | Documentacion de TI, sujeta a sus terminos | Incluido en este lote y en el sitio de TI |

No se dispone de informacion sobre otros repositorios comparables de caracteristicas equivalentes.

## Limitaciones y advertencias

- No es un modelo ejecutable: no contiene pesos, tokenizador ni configuracion de inferencia, por lo que no puede cargarse con bibliotecas como transformers, llama.cpp o vLLM.
- La licencia figura como `other` sin texto adjunto en la informacion disponible; es imprescindible revisar los terminos antes de cualquier uso comercial o redistribucion.
- Los derechos de los documentos son heterogeneos: los articulos de MDPI y Frontiers son CC-BY y los informes de OSTI/Sandia y CPSC son publicos, pero los documentos de fabricantes, los informes de NFPA, los articulos de arXiv y las tesis siguen siendo propiedad de sus editores y se incluyen solo como espejo para estudio offline.
- Quedan fuera del kit las normas de pago IEC 62606 y UL 1699, los datasets con registro previo y algunos articulos no descargables, lo que limita la cobertura normativa completa.
- El repositorio registra 0 descargas y 0 likes, y fue creado y actualizado en noviembre de 2026; no hay evidencia de validacion por terceros.
- Los archivos de mas de 100 MB estan troceados y deben reconstruirse con los scripts incluidos; un uso directo de los fragmentos produce archivos corruptos.
- No se especifican sesgos, tasas de alucinacion ni limitaciones de contexto o idioma porque no hay modelo generativo implicado.
- El sistema descrito no sustituye la certificacion de un AFCI comercial: los resultados de investigacion no equivalen al cumplimiento de UL 1699 o IEC 62606.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/danielsaldana/AFCI_part6
- Indice maestro del kit: `00_START_HERE_MASTER_INDEX.md` (dentro del repositorio)
- Checklist de descargas manuales de ST: `00_ST_MANUAL_DOWNLOAD_CHECKLIST.md` (dentro del repositorio)
- Indice de documentos y URLs de origen: `DOCUMENT_INDEX.md` y `docs_index.json` (dentro del repositorio)
- Enlaces no incluidos (normas de pago y datasets con registro): `LINKS_NOT_INCLUDED.md` (dentro del repositorio)
- Notas de proyecto y arquitectura: `PROJECT_NOTES.md` (dentro del repositorio)
- Resto de lotes del kit: https://huggingface.co/danielsaldana/AFCI_part1 hasta https://huggingface.co/danielsaldana/AFCI_part15
- Diseno de referencia TIDA-010971: https://www.ti.com/tool/TIDA-010971
- Nota de aplicacion SDAA252: https://www.ti.com/lit/pdf/SDAA252
- Familia MSPM0G5187: https://www.ti.com/product/MSPM0G5187
- Herramientas ST Edge AI Core y Cube AI Studio: https://www.st.com/en/development-tools/stm32cubeai.html
- Manual generico Arm Cortex-M4 (DUI0553): https://developer.arm.com/documentation/dui0553/latest/
- Estadisticas de incendios electricos de NFPA: https://www.nfpa.org/education-and-research/research/nfpa-research/fire-statistical-reports
- Informes de Sandia/OSTI sobre AFCI: https://www.osti.gov
