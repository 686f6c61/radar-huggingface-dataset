# shiyiwangML/MultiMFM

## Resumen

MultiMFM es un conjunto de pesos y datos publicado por Franklin Shiyi Wang y Ulrik Unneberg (Kempner Institute, Harvard University) bajo el identificador `shiyiwangML/MultiMFM`. No es un modelo de lenguaje, sino un artefacto de investigación para generación de moléculas 3D y de secuencias de ADN mediante *flow matching*. El problema que resuelve es el guiado en tiempo de inferencia (*inference-time steering*) de generadores preentrenados hacia una propiedad física objetivo —polarizabilidad, capacidad calorífica, dipolo, HOMO, LUMO o gap— sin reentrenar el modelo condicionado a esa propiedad.

La técnica central son los *meta flow maps* (MFM): un modelo destilado que proporciona una estimación barata de la posterior en pocos pasos y convierte un regresor de propiedades en un gradiente de valor utilizable para dirigir el muestreo. Sobre esa base, el procedimiento `steer_search` selecciona la mejor muestra válida según PoseBusters. El repositorio incluye además un componente para ADN basado en *discrete flow matching* (DFM) sobre ventanas de ciclizabilidad de levadura.

El paquete ocupa 1,5 GB e incluye checkpoints para QM9, GEOM-Drugs y ADN, junto con los datos de evaluación correspondientes. Su relevancia es metodológica: demuestra que se puede reutilizar un generador preentrenado y redirigirlo a objetivos físicos concretos con un coste de cómputo en inferencia, en lugar de asumir el coste de un reentrenamiento condicional completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow matching; transformer de discrete flow matching (TABASCO) para QM9; denoisers DFM para ADN; cabezas de regresión TFG-Flow y guía de huellas FP2 |
| Parametros totales | no disponible (los checkpoints individuales pesan entre 2 MB y 422 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; en ADN se entrenan estudiantes para L = 50, 100, 200 y 400 |
| Tipos de cuantizacion | no disponible (pesos en precisión de entrenamiento, sin versiones GGUF/AWQ/GPTQ publicadas) |
| Idiomas soportados | no aplica (generación de moléculas y ADN, no texto) |
| Licencia | MIT |
| Formato de pesos | no especificado en la información disponible; el repo se descarga mediante `scripts/download_artifacts.py` con verificación `SHA256SUMS` |

## Arquitectura y entrenamiento

El sistema se compone de tres piezas por familia de datos. Primero, un generador base preentrenado: en QM9 un transformer de *discrete flow matching* de la línea TABASCO; en GEOM-Drugs un modelo base de flow matching 3D; en ADN, denoisers DFM sobre ventanas de secuencia. Segundo, un *meta flow map* destilado (el "student") que aprende a aproximar en pocos pasos la distribución posterior condicionada a la propiedad, lo que abarata enormemente el cálculo del gradiente de guiado. Tercero, regresores de propiedad: en QM9 se reutilizan los de TFG-Flow (Lin et al., ICLR 2025, MIT) como guía y oráculo; en GEOM-Drugs se entrena una cabeza de huellas FP2 específica para este trabajo.

El entrenamiento del student se apoya en los regresores preentrenados y en los datos de validación de cada familia. Para ADN se derivan ventanas de ciclizabilidad del ensayo Loop-seq (Basu et al., Nature 2021) con particiones *parent-disjoint*, de modo que no hay fuga de secuencias emparentadas entre train y test. El repositorio incluye los argumentos y configuraciones de entrenamiento en cada carpeta de checkpoints, y el código de reentrenamiento está en el repositorio GitHub asociado. La innovación destacable es el propio mecanismo de guiado: el MFM convierte un regresor en un gradiente de valor y `steer_search` explora candidatos para quedarse con el mejor válido según PoseBusters.

## Capacidades

- Generación de moléculas 3D con guiado hacia propiedades físicas objetivo: polarizabilidad, capacidad calorífica, dipolo, HOMO, LUMO y gap.
- Guiado en tiempo de inferencia sin reentrenamiento condicional del generador base.
- Estimación de posterior en pocos pasos mediante meta flow maps destilados.
- Búsqueda y selección de candidatos con validación PoseBusters (`steer_search`).
- Guiado por huellas moleculares FP2 en GEOM-Drugs.
- Generación de secuencias de ADN con discrete flow matching para longitudes de 50, 100, 200 y 400.
- Modelado de ciclizabilidad de ADN con guía y oráculo C0.
- No soporta tool calling, agentes, visión, audio ni generación de texto: no es un modelo de lenguaje.

## Casos de uso

- Diseño de moléculas con polarizabilidad objetivo: se parte del generador base de QM9 o GEOM-Drugs y se aplica el MFM con el regresor de polarizabilidad como guía, obteniendo candidatos desplazados hacia el valor deseado sin reentrenar.
- Optimización de huecos HOMO-LUMO para materiales orgánicos: el guiado sobre gap permite explorar la frontera entre moléculas conductoras y aislantes dentro del espacio químico aprendido por el generador.
- Cribado virtual con restricción de validez química: `steer_search` filtra por PoseBusters, de modo que el pipeline puede usarse para generar lotes de candidatos válidos antes de un cálculo DFT costoso.
- Ajuste de capacidad calorífica en fluidos de trabajo: útil en la búsqueda de moléculas para ciclos termodinámicos, donde la propiedad es un criterio de selección directo.
- Estudio de diseño de secuencias de ADN con ciclizabilidad controlada: los estudiantes DFM para L = 50 a 400 permiten generar ventanas con propiedades de flexibilidad dirigidas, relevantes en biología de cromatina.
- Reproducción y extensión metodológica: el paquete incluye datos, configuraciones y scripts de descarga verificada, por lo que sirve como base para probar nuevos regresores o nuevos mecanismos de guiado sobre los mismos generadores.
- Evaluación comparativa de métodos de steering: al incluir oráculos y regresores separados, permite medir la brecha entre la propiedad predicha por la guía y la evaluada por el oráculo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una "QM9 table" asociada al estudiante CE/ESD, pero no se incluyen cifras numéricas en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Los checkpoints van de 2 MB (estudiantes QM9) a 422 MB (GEOM-Drugs), por lo que el modelo base completo cabe con holgura en GPUs de consumo, pero no se documentan requisitos de memoria en ejecución.
- GPU recomendadas: no disponible. Por tamaño de pesos, cualquier GPU con al menos 8 GB de VRAM debería poder cargar los checkpoints de mayor tamaño, aunque el coste real depende del número de pasos de muestreo y del tamaño de lote en `steer_search`.
- Cabe en GPU de consumo: probablemente sí para todas las familias, dado el tamaño de los checkpoints; no confirmado en la documentación.
- Opciones de despliegue: el flujo previsto es clonar el repositorio de código y ejecutar `scripts/download_artifacts.py`; no se documenta integración con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Guiado por propiedad | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MultiMFM | Flow matching + meta flow maps | no disponible | L = 50-400 en ADN | En inferencia, sin reentrenar | MIT | Pesos y datos en HF |
| TFG-Flow | Flow matching condicional | no disponible | no disponible | Requiere condicionamiento en entrenamiento | MIT | Reutilizado como componente |
| TABASCO | Discrete flow matching | no disponible | no disponible | No documentado en la información disponible | no disponible | Release preprocesado en HF |

La comparación directa con generadores moleculares condicionales no puede cuantificarse porque no hay cifras de benchmarks ni recuentos de parámetros en el material disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no admite prompts en lenguaje natural ni tareas de texto, código o razonamiento.
- El guiado depende de la calidad del regresor utilizado; un regresor sesgado desplaza la generación hacia regiones químicamente poco realistas aunque la propiedad predicha sea la deseada.
- La validación se limita a PoseBusters; no se documenta verificación con cálculos de nivel DFT en la información disponible.
- Los dominios están acotados a QM9 (moléculas pequeñas), GEOM-Drugs (fármacos) y ventanas de ADN de hasta 400 posiciones; no hay evidencia de generalización fuera de ellos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación independiente por parte de la comunidad.
- La licencia MIT cubre código y pesos, pero los datos de terceros (GEOM-Drugs CC0-1.0, Loop-seq) tienen sus propias condiciones y las atribuciones deben conservarse según `THIRD_PARTY.md`.
- No se redistribuyen los registros crudos de Loop-seq, solo ventanas derivadas, lo que puede limitar la reproducibilidad exacta del preprocesado.
- No hay información sobre sesgos, calibración ni comportamiento fuera de distribución.

## Enlaces

- Hugging Face: https://huggingface.co/shiyiwangML/MultiMFM
- Repositorio de código: https://github.com/shiyiwang958/MultiMFM
- README del repositorio: https://github.com/shiyiwang958/MultiMFM/blob/main/README.md
- Página del proyecto: https://shiyiwang958.github.io/multimodal-meta-flow-maps/
- TFG-Flow (Lin et al., ICLR 2025): no disponible enlace directo en la información proporcionada
- GEOM-Drugs (Axelrod & Gómez-Bombarelli, Sci. Data 2022): no disponible enlace directo en la información proporcionada
- Loop-seq (Basu et al., Nature 2021): no disponible enlace directo en la información proporcionada
- Release preprocesado TABASCO GEOM-Drugs: https://huggingface.co/carlosinator/tabasco-geom-drugs
