# nestorvfx/surfnet

## Resumen

SurfNet es un modelo neuronal de reconstrucción de superficies diseñado específicamente para el desafío de los papiros de Herculano: colocar la superficie de una hoja de papiro dentro de un escaneo de tomografía computarizada (CT) de un rollo carbonizado. Lo desarrolla nestorvfx y se publica bajo licencia MIT en Hugging Face. No es un modelo de lenguaje: es una red de 22,8 millones de parámetros en fp32 que opera sobre volúmenes 3D y mallas de superficie, no sobre tokens de texto.

El modelo resuelve un problema muy concreto: dado un fragmento de superficie ya validado por el investigador (las celdas «aprobadas»), SurfNet extiende o corrige esa superficie en las zonas pendientes, ajustándose a la geometría real del rollo. Su función principal es la de corrector: se ejecuta sobre la salida de GrowPatch (el método de crecimiento de superficie del mismo repositorio) y repara los casos en los que este falla.

Su relevancia radica en los resultados publicados: sobre 80 casos de prueba en cuatro vueltas de PHerc0139 nunca vistas en entrenamiento, la combinación GrowPatch → SurfNet eleva la puntuación media de 83,6 a 87,5 y reduce la tasa de fallo del 24 % al 11 %, corrigiendo 10 de los 19 casos fallidos sin estropear ninguno de los 61 restantes. Es una herramienta de nicho para el pipeline de lectura virtual de papiros, no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal para reconstrucción de superficies 3D (detalles internos no disponibles en la model card) |
| Parametros totales | 22,8 M (fp32) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo no lingüístico) |
| Tipos de cuantizacion | no disponible; pesos publicados en fp32 |
| Idiomas soportados | no aplica (modelo no lingüístico) |
| Licencia | MIT (pesos y código) |
| Formato de pesos | `.pt` (PyTorch): `surfnet_base.pt`, `surfnet_pherc0211.pt` |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna de la red (capas, tipo de bloque, mecanismo de atención o convolución); solo indica que es un modelo PyTorch de 22,8 M de parámetros que opera sobre hojas en formato tifxyz (convención de VC3D), máscaras de celdas aprobadas y volúmenes CT, con una resolución de paso de 9,362 µm en los ejemplos. El entrenamiento se realizó durante 42.000 pasos con batch de 8 sobre errores sintéticos generados a partir de ground truth oficial, usando las celdas aprobadas como prompt.

El conjunto de entrenamiento suma 3.284 cm² en 38 objetos: 27 vueltas ground-truth de PHerc0139 (1.081 cm²), un desplegado fusionado de PHerc1667 con 31 envolventes (1.212 cm²) y 10 segmentos con etiquetas de tinta de PHercParis4, PHerc0814, PHerc0009B y PHerc0500P2 (991 cm²). Nunca se entrenó con PHerc0139 w056-w059, PHerc0841, PHerc1447 ni PHerc0343. El modelo admite fine-tuning sobre la parte aprobada de una hoja propia, lo que adapta la red al CT concreto del rollo y a la convención de superficie del usuario; el repositorio incluye los comandos. La variante `surfnet_pherc0211.pt` es el resultado de 6.000 pasos de fine-tuning (unos 40 minutos en una GPU de 24 GB) sobre 415 mm² de celdas aprobadas de una hoja de PHerc0211.

## Capacidades

- Extensión de superficies de papiro en volúmenes CT a partir de celdas aprobadas por el investigador.
- Corrección de superficies generadas por GrowPatch: reposiciona celdas mal colocadas y repara casos fallidos.
- Relleno de pequeños agujeros en la superficie (huecos de hasta 3,8 mm de diámetro con puntuación de 96,0).
- Adaptación mediante fine-tuning a un rollo y convención de superficie concretos.
- Funcionamiento en modo «fast» con borrador conservado (`--keep-draft`) para revisión posterior.
- Integración con el ecosistema VC3D (formatos tifxyz y zarr, binario `vc3d/squashfs-root/AppRun`).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Lectura virtual de rollos de Herculano: dado un fragmento de superficie ya validado en un escaneo CT de un rollo carbonizado, SurfNet extiende la malla hacia las zonas no resueltas, lo que permite avanzar en la segmentación de vueltas antes de aplicar modelos de detección de tinta.
- Corrección de pipelines existentes: ejecutar `surfnet correct` sobre la salida de GrowPatch reduce la tasa de fallo del 24 % al 11 % en el benchmark publicado, por lo que se integra como paso de post-proceso en flujos ya establecidos sin reemplazarlos.
- Reparación de agujeros en superficies: en áreas con huecos de hasta 3,8 mm, SurfNet alcanza 96,0 de puntuación, lo que lo hace adecuado para cerrar discontinuidades en mallas parcialmente reconstruidas.
- Adaptación a un rollo nuevo: con 415 mm² de celdas aprobadas y unos 40 minutos de fine-tuning en una GPU de 24 GB se obtiene una variante específica (como `surfnet_pherc0211.pt`) que mejora la extensión de 29,8 a 43,5 en áreas no vistas del mismo rollo.
- Investigación en reconstrucción de superficies: el par base/fine-tuned y el benchmark de 80 casos del repositorio sirven como línea base reproducible para comparar nuevos métodos de crecimiento de superficie.
- Docencia y experimentación en visión 3D aplicada al patrimonio: el tamaño reducido (22,8 M de parámetros, 0,2 GB de repo) y la licencia MIT permiten desplegarlo en entornos académicos con recursos limitados.
- Validación cruzada de anotaciones: al comparar la superficie corregida con la generada por GrowPatch, el investigador puede identificar celdas dudosas y priorizar la revisión manual.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre 80 casos de prueba en cuatro vueltas de PHerc0139 no vistas en entrenamiento, evaluados contra ground truth oficial. La puntuación (0-100) da crédito completo dentro de 2 vóxeles del ground truth y decae linealmente hasta cero a la mitad del espaciado entre vueltas; un caso falla si más del 10 % de su área queda en la hoja equivocada.

| Metrica | GrowPatch solo | GrowPatch → SurfNet | SurfNet solo |
|---|---|---|---|
| Puntuación, 80 casos | 83,6 | **87,5** | 54,1 |
| Tasa de fallo, 80 casos | 24 % | **11 %** | 74 % |
| Puntuación, agujeros de hasta 3,8 mm (12 casos) | 82,3 | 95,4 | **96,0** |

GrowPatch → SurfNet superó a GrowPatch en 62 de los 80 casos y quedó por debajo en 8. Corrigió 10 de los 19 casos fallidos de GrowPatch y no falló ninguno de los otros 61. SurfNet por sí solo solo es fiable cerca de celdas aprobadas.

Fine-tuning sobre PHerc0211 (puntuación de SurfNet solo, cinco áreas no vistas de la misma hoja):

| Area | Base | Fine-tuned |
|---|---|---|
| Extensión | 29,8 | 43,5 |
| Extensión con lado derecho dado | 50,9 | 64,7 |
| Junto al borde entrenado | 64,6 | 66,6 |
| Agujero de 2,3 mm | 97,8 | 96,5 |
| Agujero de 1,8 mm | 97,8 | 97,8 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 22,8 M de parámetros en fp32 los pesos ocupan unos 91 MB, por lo que el grueso del consumo proviene del volumen CT y de las estructuras de la malla, no del modelo.
- GPU recomendadas: la model card cita una GPU de 24 GB para el fine-tuning de 6.000 pasos en unos 40 minutos; no se especifica el modelo concreto (A100, RTX 4090 u otro).
- Cabe en GPU de consumo: muy probablemente sí por tamaño de pesos, pero no se confirma en la información disponible; el cuello de botella es la memoria del volumen CT.
- Opciones de despliegue: no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican). El despliegue es mediante la CLI `surfnet` del repositorio, que requiere `setup.sh` y el binario VC3D (`vc3d/squashfs-root/AppRun`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han publicado comparativas con otros modelos de reconstrucción de superficie de papiros en la información disponible. La única comparación interna es contra GrowPatch, el método de crecimiento de superficie del mismo repositorio, que se usa como entrada y línea base:

| Metodo | Puntuación (80 casos) | Tasa de fallo | Licencia | Disponibilidad |
|---|---|---|---|---|
| GrowPatch solo | 83,6 | 24 % | MIT (mismo repositorio) | github.com/nestorvfx/RectoLocalScrollSolvers |
| GrowPatch → SurfNet | 87,5 | 11 % | MIT | Hugging Face + repositorio |
| SurfNet solo | 54,1 | 74 % | MIT | Hugging Face + repositorio |

## Limitaciones y advertencias

- El modelo base solo se ha evaluado en un rollo (PHerc0139), en cuatro vueltas situadas a 1-4 vueltas de la más cercana vista en entrenamiento; su precisión en otros rollos no está medida.
- La variante fine-tuned solo se ha evaluado en cinco áreas de una única hoja de PHerc0211; el efecto de más área aprobada no se probó.
- SurfNet por sí solo es poco fiable (74 % de fallos, puntuación 54,1): solo funciona bien cerca de celdas aprobadas y como corrector de otro método.
- En las áreas de PHerc0211, GrowPatch colocó la mayor parte de cuatro de las cinco áreas en la hoja equivocada, por lo que la combinación GrowPatch → SurfNet puntuó bajo con ambos modelos; el solver local recto del mismo repositorio obtuvo la mejor puntuación en cuatro de las cinco.
- Los pesos se entrenaron con datos abiertos de Vesuvius Challenge bajo licencia CC BY-NC 4.0; aunque el código y los pesos se publican como MIT, los datos subyacentes mantienen sus términos, lo que conviene revisar antes de usos comerciales.
- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes; cualquier expectativa en ese sentido es un error de categoría.
- No se documentan sesgos, tasas de alucinación ni comportamiento multilingüe porque no aplican a este tipo de modelo.
- El pipeline depende de formatos y herramientas específicas (tifxyz, zarr, binario VC3D), lo que limita su portabilidad a otros entornos de reconstrucción.

## Enlaces

- Hugging Face: https://huggingface.co/nestorvfx/surfnet
- Repositorio de código, documentación y benchmark completo: https://github.com/nestorvfx/RectoLocalScrollSolvers
- Pesos base: https://huggingface.co/nestorvfx/surfnet/resolve/main/surfnet_base.pt
- Pesos fine-tuned en PHerc0211: https://huggingface.co/nestorvfx/surfnet/resolve/main/surfnet_pherc0211.pt
- Checksums: https://huggingface.co/nestorvfx/surfnet/resolve/main/SHA256SUMS
- Dataset de entrenamiento citado: «Vesuvius Challenge - CT Scans of Herculaneum Papyri» (CC BY-NC 4.0; enlace directo no disponible en la información proporcionada)
