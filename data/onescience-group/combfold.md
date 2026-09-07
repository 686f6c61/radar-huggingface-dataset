# OneScience-Group/CombFold

## Resumen

CombFold es un pipeline open-source desarrollado por el laboratorio dina-lab3D y publicado por OneScience-Group para predecir la estructura tridimensional de complejos proteicos de gran tamaño. A diferencia de los modelos de plegamiento de proteínas convencionales, CombFold no es una red neuronal entrenable, sino un sistema que combina las predicciones de AlphaFold-Multimer con un algoritmo de ensamblaje combinatorio implementado en C++17. A partir de las secuencias de aminoácidos de las cadenas individuales, el pipeline predice múltiples subcomplejos candidatos y los ensambla en el complejo completo, lo que permite abordar estructuras con hasta 18.000 aminoácidos y 32 subunidades según la publicación original.

El repositorio incluye los pesos preentrenados de AlphaFold-Multimer para la inferencia offline mediante ColabFold, así como las herramientas de ensamblaje y los scripts de automatización. CombFold resuelve el problema de los límites de tamaño y número de cadenas de los modelos de plegamiento tradicionales, que suelen estar restringidos a complejos pequeños. Su relevancia actual radica en la necesidad de modelar maquinarias biológicas complejas, como complejos de poro nuclear, sistemas de transcripción o ensamblajes de membrana, donde la predicción estructural es esencial para entender la función.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de predicción de estructuras de complejos proteicos basado en AlphaFold-Multimer (JAX) y ensamblador combinatorio C++17 |
| Parametros totales | no disponible |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No aplicable (modelo de biología estructural; soporta complejos de hasta 18.000 aminoácidos y 32 subunidades según la publicación) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (documentación e interfaz en inglés; entrada basada en secuencias de aminoácidos) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (el repositorio incluye pesos preentrenados de AlphaFold-Multimer en `weight/`) |

## Arquitectura y entrenamiento

CombFold no es un modelo entrenado; se compone de cuatro etapas. Primero se definen las subunidades según dominios proteicos y composición de cadenas, generando `subunits.json`. Después se generan archivos FASTA para todos los pares de subunidades y se predicen subcomplejos por pares mediante AlphaFold-Multimer. Opcionalmente se predicen subcomplejos de más de dos subunidades. Finalmente, se extraen las transformaciones relativas entre subunidades de las estructuras PDB predichas y se aplica un algoritmo de optimización combinatoria en C++ para ensamblar el complejo completo.

La inferencia neuronal la realizan los modelos preentrenados AlphaFold-Multimer, mientras que CombFold se encarga de extraer transformaciones estructurales y realizar el ensamblaje combinatorio. La innovación principal es la combinación de predicciones locales de subcomplejos con un algoritmo de ensamblaje global, que supera los límites de tamaño de las predicciones directas.

## Capacidades

- Predicción de estructuras de complejos proteicos grandes, con soporte declarado para al menos 18.000 aminoácidos y hasta 32 subunidades.
- Modelado de homómeros, ensamblando múltiples copias de la misma subunidad según una estequiometría especificada.
- Modelado de heterómeros, integrando predicciones de diferentes pares o grupos de subunidades.
- Ensamblaje a partir de estructuras PDB ya predichas por AlphaFold-Multimer, sin necesidad de reejecutar la inferencia neuronal.
- Soporte opcional de restricciones de crosslinking para guiar y filtrar los ensamblajes candidatos.
- No es un modelo de lenguaje, por lo que no soporta tool calling, generación de texto ni tareas de procesamiento de lenguaje natural.

## Casos de uso

- Predicción de complejos proteicos grandes: El pipeline permite modelar maquinarias como el complejo del poro nuclear o el espliceosoma, que superan los límites de AlphaFold-Multimer convencional. Se generan predicciones de subcomplejos y se ensamblan con el algoritmo combinatorio.
- Modelado de homómeros con estequiometría conocida: Para complejos formados por múltiples copias de la misma subunidad (p. ej. canales iónicos o cápsides virales), CombFold utiliza la estequiometría especificada para ensamblar las copias correctas.
- Modelado de heterómeros multi-subunidad: En complejos como receptores de membrana o complejos de transcripción, CombFold integra predicciones de diferentes pares o grupos de subunidades para construir la estructura completa.
- Reutilización de predicciones PDB existentes: El script `run_on_pdbs.py` permite ensamblar un complejo a partir de estructuras ya predichas por AlphaFold-Multimer, sin necesidad de reejecutar la inferencia neuronal, lo que ahorra tiempo y recursos.
- Ensamblaje guiado por crosslinks: La opción de incorporar restricciones de crosslinking (datos de XL-MS) permite filtrar los ensamblajes candidatos y mejorar la precisión en complejos con múltiples conformaciones posibles.
- Generación de modelos para simulación de dinámica molecular: Las estructuras completas producidas por CombFold pueden usarse como punto de partida para simulaciones de dinámica molecular, estudios de interacción proteína-ligando o diseño racional de fármacos.
- Estudio de interacciones proteína-proteína: En entornos de investigación, el pipeline facilita el análisis de redes de interacción en complejos grandes, proporcionando modelos estructurales que sirven de base para experimentos de mutagénesis o ingeniería de proteínas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La publicación original reporta soporte para complejos de al menos 18.000 aminoácidos y hasta 32 subunidades, pero no se proporcionan datos numéricos comparativos con otros modelos en la información suministrada.

## Requisitos de hardware

- El ensamblaje combinatorio C++17 requiere únicamente recursos de CPU; no necesita GPU.
- La predicción de subcomplejos con AlphaFold-Multimer requiere un acelerador (GPU o DCU).
- El consumo de memoria aumenta con el número total de residuos, la profundidad del MSA, el número de modelos y el número de recycles.
- El repositorio tiene un tamaño de 4.2 GB.
- PyTorch no es una dependencia directa del runtime de CombFold ni del pipeline ColabFold actual.
- Opciones de despliegue: OneCode (entorno online de OneScience), instalación manual, ColabFold offline.
- No se proporcionan estimaciones de VRAM, latencia ni throughput en la información disponible.

## Comparativa con modelos similares

No se dispone de datos numéricos de benchmarks para esta comparación en la información proporcionada. CombFold se diferencia de AlphaFold-Multimer por su enfoque de ensamblaje combinatorio, que permite construir complejos grandes a partir de predicciones de subcomplejos. ColabFold proporciona una interfaz optimizada para AlphaFold-Multimer pero no incluye el ensamblaje combinatorio.

| Modelo | Enfoque | Parámetros | Contexto (tamaño de complejo) | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| CombFold | Ensamblaje combinatorio + AlphaFold-Multimer | no disponible | Hasta 18.000 aa y 32 subunidades (según publicación) | no disponible | Apache-2.0 | Hugging Face |
| AlphaFold-Multimer | Predicción directa de complejos | no disponible | no disponible | no disponible | no disponible | no disponible |
| ColabFold | Predicción directa de complejos con MSA optimizado | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- CombFold no es un modelo entrenable; la calidad de las predicciones depende de los pesos preentrenados de AlphaFold-Multimer.
- La precisión puede verse afectada por la calidad del MSA y por la predicción de los subcomplejos individuales.
- El ensamblaje combinatorio puede fallar en complejos con dominios muy flexibles o con un número elevado de subunidades.
- Riesgo de predicciones estructurales incorrectas, especialmente en regiones flexibles o sin alineamientos de alta calidad.
- No es aplicable a tareas de procesamiento de lenguaje natural, ya que no es un modelo de lenguaje.
- La instalación requiere compilar el ensamblador C++17 con Boost, lo que puede resultar complejo según la plataforma.
- No se han documentado sesgos específicos, al no ser un modelo de lenguaje.

## Enlaces

- Hugging Face: https://huggingface.co/OneScience-Group/CombFold
- Artículo original: https://www.nature.com/articles/s41592-024-02174-0
- Perfil de OneScience en Hugging Face: https://huggingface.co/OneScience-Group/models
