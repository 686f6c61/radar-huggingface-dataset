# Jas-preet/SPOT-Contact-LM

## Resumen

SPOT-Contact-LM (también denominado SPOT-Contact-Single) es un modelo de predicción de mapas de contacto residuo-residuo en proteínas a partir de una única secuencia de aminoácidos. Lo desarrollan Jaspreet Singh, Thanh Litfin, Kuldip Paliwal y Yaoqi Zhou, y se publicó en *Bioinformatics* en 2022. Sustituye la dependencia tradicional de alineamientos múltiples (MSA) por mapas de atención internos del modelo de lenguaje proteico ESM-1b, combinados con predicciones de estructura secundaria y codificación one-hot.

El modelo no es un LLM de texto: es un conjunto (ensemble) de seis redes ResNet de 12 bloques que consumen representaciones de ESM-1b para predecir contactos (distancia Cβ–Cβ ≤ 8 Å) y bins de distancia. Su relevancia radica en que permite obtener información estructural útil cuando no existen homólogos suficientes para construir un MSA fiable, un escenario habitual en proteínas huérfanas o de diseño.

Los pesos se distribuyen como checkpoints TorchScript dentro de un archivo `contact_jits.tar.xz` de 101 MB, con licencia MIT y uso pensado para investigación. El repositorio de Hugging Face tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de seis ResNet de 12 bloques sobre representaciones de ESM-1b (tres predicen contactos, tres predicen bins de distancia) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (secuencias de hasta 500 residuos en entrenamiento) |
| Tipos de cuantizacion | no disponible (checkpoints TorchScript en precisión original) |
| Idiomas soportados | no aplica (modelo de proteínas, no de lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | TorchScript (archivo `contact_jits.tar.xz`, 101 MB) |

## Arquitectura y entrenamiento

SPOT-Contact-LM combina un extractor de características (ESM-1b, transformer de proteínas preentrenado) con un cabezal supervisado formado por seis ResNet de 12 bloques. Tres de las redes predicen directamente el mapa de contactos binario y las otras tres predicen bins de distancia; las predicciones se combinan en un ensemble. Las entradas varían entre los miembros del ensemble: atención de la última capa de ESM-1b, atención de todas las capas, y atención de todas las capas más características one-hot y predicciones de SPOT-1D-Single. Este diseño evita depender de un MSA en tiempo de inferencia.

El entrenamiento utilizó 34.691 proteínas de ProteinNet (entradas PDB anteriores a 2016, resolución inferior a 2,5 Å, agrupadas al 95 % de identidad de secuencia y con hasta 500 residuos). Un contacto se define como una distancia Cβ–Cβ de como máximo 8 Å. No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de alineamiento, algo esperable en un modelo de predicción estructural.

## Capacidades

- Predicción de mapas de contacto residuo-residuo a partir de una única secuencia proteica.
- Predicción de bins de distancia entre residuos mediante los tres cabezales específicos.
- Funciona sin MSA, lo que permite aplicarlo a proteínas sin homólogos conocidos.
- Integración con SPOT-1D-Single para incorporar predicciones de estructura secundaria como característica adicional.
- Ejecución mediante TorchScript, lo que permite desplegarlo en Python sin dependencias de frameworks de LLM.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües de lenguaje natural.

## Casos de uso

- Análisis de proteínas huérfanas: cuando no existe un MSA informativo, el modelo genera un mapa de contacto útil para inferir restricciones estructurales básicas.
- Predicción de estructura ab initio: los mapas de contacto y bins de distancia pueden alimentar herramientas de plegamiento como restricciones geométricas.
- Anotación funcional de proteínas de diseño: permite evaluar rápidamente si una secuencia sintética presenta un patrón de contactos compatible con un pliegue conocido.
- Filtrado en pipelines de metagenómica: cribar grandes conjuntos de secuencias sin homólogos y priorizar candidatos con topología plausible.
- Docencia e investigación en bioinformática: el CLI del repositorio de GitHub permite reproducir experimentos y comparar con métodos basados en MSA.
- Validación cruzada con predictores de estructura secundaria: combinar sus salidas con SPOT-1D-Single para construir un perfil estructural más completo antes de pasar a modelado 3D.
- Análisis de variantes: estudiar cómo mutaciones puntuales alteran los patrones de contacto predichos en regiones de interés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el tamaño del ensemble (101 MB comprimido) sugiere que cabe holgadamente en GPUs de consumo, aunque la memoria real depende de la longitud de la secuencia y de las activaciones de ESM-1b.
- GPU recomendadas: no disponible en la información proporcionada; por el perfil del modelo, una GPU con al menos 8 GB debería ser suficiente para secuencias de hasta 500 residuos, aunque este dato no está confirmado por el autor.
- Cabe en GPU de consumo: probablemente sí (RTX 3060/4060 o superiores), sin confirmación oficial.
- Opciones de despliegue: TorchScript vía PyTorch; el CLI del repositorio de GitHub es la vía documentada. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Enfoque | Dependencia de MSA | Licencia | Disponibilidad |
|---|---|---|---|---|
| SPOT-Contact-LM | ESM-1b + ResNet ensemble | No | MIT | Hugging Face + GitHub |
| SPOT-Contact (original) | CNN sobre features derivadas de MSA | Sí | no disponible en la información | GitHub del grupo |
| SPOT-1D-Single | Predicción de estructura secundaria desde secuencia única | No | no disponible en la información | Hugging Face (Jas-preet/SPOT-1D-Single) |
| ESM-1b (base) | Transformer de proteínas preentrenado | No | MIT | Hugging Face (facebook/esm-1b) |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Entrenado con proteínas de hasta 500 residuos; secuencias más largas pueden degradar la calidad o no ser soportadas por el pipeline.
- Restringido a entradas PDB anteriores a 2016 con resolución < 2,5 Å; puede tener sesgo hacia pliegues sobrerrepresentados en el PDB.
- La definición de contacto es Cβ–Cβ ≤ 8 Å; no sustituye a un modelo de estructura 3D completo.
- No es un modelo de lenguaje natural: no procesa texto, no soporta tool calling ni agentes.
- Licencia MIT permite uso comercial, pero la model card indica que el CLI se ofrece "for research purposes"; conviene revisar los términos del repositorio antes de integrarlo en producción.
- Riesgo de falsos positivos y negativos en regiones desordenadas o con contactos de largo alcance.
- No se documentan sesgos específicos ni evaluaciones de robustez fuera del conjunto de test original.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de mantenimiento activo.

## Enlaces

- Hugging Face: https://huggingface.co/Jas-preet/SPOT-Contact-LM
- Repositorio GitHub: https://github.com/jas-preet/SPOT-Contact-LM
- README en GitHub: https://github.com/jas-preet/SPOT-Contact-LM/blob/main/README.md
- Paper (Bioinformatics, 2022): https://doi.org/10.1093/bioinformatics/btac053
- SPOT-1D-Single (modelo relacionado): https://huggingface.co/Jas-preet/SPOT-1D-Single
- ESM-1b (modelo base): https://huggingface.co/facebook/esm-1b
