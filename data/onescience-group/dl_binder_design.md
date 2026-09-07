# OneScience-Group/dl_binder_design

## Resumen

`dl_binder_design` es un pipeline de diseño de binders de proteínas de novo desarrollado por el grupo OneScience, basado en el trabajo de Bennett et al. publicado en *Nature Communications*. No se trata de un modelo de lenguaje ni de una red neuronal única, sino de un flujo de inferencia compuesto por varios modelos preentrenados y herramientas de modelado estructural: ProteinMPNN para el diseño de secuencias de aminoácidos, PyRosetta FastRelax para la optimización estructural opcional y una implementación modificada de AlphaFold2 que acepta una suposición estructural inicial para validar el complejo diseñado.

El pipeline resuelve el problema de diseñar secuencias de péptidos o proteínas que se unan a una proteína diana, a partir de un backbone de complejo binder-objetivo. La relevancia actual radica en su aplicación directa en biología computacional y diseño de fármacos, ya que permite generar candidatos y evaluar su plausibilidad estructural con métricas de confianza como pLDDT, PAE y RMSD. El repositorio incluye 10 ejemplos de backbones de complejos y archivos de referencia, y el paquete completo ocupa 0,5 GB.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline compuesto por ProteinMPNN, PyRosetta FastRelax y AlphaFold2 (con initial guess) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (documentación y código) |
| Licencia | MIT |
| Formato de pesos | no disponible (pesos de ProteinMPNN y AlphaFold2 cargados desde archivos .npz y checkpoints) |

## Arquitectura y entrenamiento

El paquete no es una red neuronal única, sino un pipeline de inferencia compuesto. El flujo principal toma un backbone de complejo binder-objetivo en formato PDB o archivo Rosetta silent y lo procesa en tres etapas: primero, ProteinMPNN diseña las secuencias de aminoácidos del binder; después, opcionalmente, PyRosetta FastRelax optimiza la estructura del complejo para reducir choques locales; finalmente, una implementación de AlphaFold2 modificada para aceptar una suposición estructural inicial re-predice el complejo y reporta pLDDT, PAE, interacción PAE y RMSD.

La información disponible no detalla los datos de entrenamiento ni el proceso de entrenamiento de los modelos individuales. La innovación técnica destacable es la integración de AlphaFold2 con un "initial guess" estructural, que permite evaluar complejos diseñados en lugar de predecir estructuras desde cero. El pipeline no genera el backbone del binder directamente a partir de una estructura objetivo; el backbone de entrada debe generarse previamente con herramientas como RFdiffusion o proporcionarse directamente.

## Capacidades

- Diseño de secuencias de binder: utiliza ProteinMPNN para generar secuencias de aminoácidos candidatas a partir de un backbone de complejo binder-objetivo.
- Optimización estructural: aplica PyRosetta FastRelax de forma opcional para aliviar choques locales y optimizar la geometría del complejo.
- Validación estructural: usa AlphaFold2 con una suposición inicial para re-predecir el complejo y evaluar su calidad mediante pLDDT, PAE, interacción PAE y RMSD.
- Filtrado de candidatos: permite ordenar y seleccionar diseños según métricas de confianza y consistencia estructural.
- Procesamiento por lotes: admite directorios de PDB, runlists, checkpoints y archivos Rosetta silent.
- Sin capacidades de texto, visión ni audio: no es un modelo multimodal.

## Casos de uso

- Diseño de nuevos binders de proteínas: dado un backbone de complejo binder-objetivo, por ejemplo generado con RFdiffusion, el pipeline genera secuencias candidatas para el binder. Es adecuado porque ProteinMPNN está entrenado para diseñar secuencias compatibles con una estructura dada.
- Optimización de secuencia y estructura: alternar ProteinMPNN con PyRosetta FastRelax permite refinar diseños iniciales, reducir choques estructurales y mejorar la geometría del complejo antes de la validación.
- Validación de complejos diseñados: usar la etapa de AlphaFold2 con initial guess para comprobar si el complejo diseñado es plausible. Es adecuado porque proporciona métricas objetivas como pLDDT y PAE de interacción.
- Filtrado de candidatos en campañas de descubrimiento: ordenar miles de secuencias generadas según interacción PAE y RMSD alineado para seleccionar las más prometedoras antes de realizar validación experimental.
- Integración con herramientas de diseño generativo: el pipeline acepta backbones de RFdiffusion, por lo que se puede encadenar con otros modelos de diseño de proteínas para un flujo completo de diseño y evaluación.
- Procesamiento por lotes en laboratorios computacionales: automatizar el diseño sobre directorios de PDB y archivos silent, útil en pipelines de alto rendimiento para cribado virtual.
- Uso en entornos de computación científica: disponible en el entorno OneCode, que ofrece una experiencia de programación AI4S con instalación simplificada y soporte para GPU o DCU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- ProteinMPNN: soporta ejecución en CPU y en dispositivos aceleradores visibles para PyTorch.
- PyRosetta FastRelax: se ejecuta principalmente en CPU; se recomienda una CPU de alto rendimiento con muchos núcleos.
- AlphaFold2: el uso de memoria y el tiempo de ejecución aumentan con la longitud del complejo y el número de recycles. No se especifica VRAM, pero la implementación estándar requiere GPU para un rendimiento razonable.
- Espacio en disco: se necesitan aproximadamente 356 MB para el archivo `params_model_1_ptm.npz`, además de los pesos de ProteinMPNN, la instalación de PyRosetta y los archivos de salida.
- Despliegue: instalación manual con `onescience[bio-gpu]` (GPU) o `onescience[bio-dcu]` (DCU), o a través del entorno OneCode.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible.

## Limitaciones y advertencias

- El pipeline no genera un backbone de binder directamente a partir de una estructura objetivo; requiere un backbone de entrada generado previamente, por ejemplo con RFdiffusion, o proporcionado como PDB o archivo silent.
- La implementación actual de AlphaFold2 en este pipeline soporta como máximo dos cadenas, y la primera cadena debe ser el binder y la segunda el objetivo.
- La instalación es compleja: requiere dependencias de PyRosetta, ProteinMPNN y AlphaFold2, así como archivos de parámetros grandes.
- El tiempo de ejecución de FastRelax y AlphaFold2 puede ser elevado dependiendo de la longitud del complejo y del número de recycles.
- No es un modelo de lenguaje; no ofrece generación de texto, visión ni audio.
- Las métricas de confianza (pLDDT, PAE) son predictivas y no sustituyen la validación experimental; existe riesgo de falsos positivos en la predicción de interacciones.
- La licencia MIT permite uso comercial, pero la documentación no detalla sesgos específicos ni limitaciones adicionales de rendimiento.

## Enlaces

- HuggingFace: https://huggingface.co/OneScience-Group/dl_binder_design
- GitHub original: https://github.com/nrbennet/dl_binder_design
- Paper: https://www.nature.com/articles/s41467-023-38328-5
- DeepWiki: https://deepwiki.com/nrbennet/dl_binder_design
- OneCode: https://web-2069360198568017922-iaaj.ksai.scnet.cn:58043/home
