# dimitarpg13/semsimula-ladder-live-owt-d384-l2-attention-potential-rfqk-norc

## Resumen

`semsimula-ladder-live-owt-d384-l2-attention-potential-rfqk-norc` es un modelo de lenguaje de investigación desarrollado por el usuario dimitarpg13 dentro de la familia SemSimula, un programa que explora modelos de lenguaje conservativos (derivados de un potencial escalar) en lugar de la arquitectura transformer convencional. El modelo es un instrumento de medición de ablaciones: su propósito no es competir en calidad de generación, sino aislar el efecto de un mecanismo concreto, en este caso un "campo de intercambio" de tipo atención, sobre una base conservativa.

Concretamente, el modelo parte de la variante conservativa pura (F3.1) y le añade únicamente un campo de intercambio endurecido, sin lectura de registros. Completa una comparación 2×2 entre dos rutas de tipo atención (campo de intercambio y ruta de registros) dentro de la misma familia. Tiene 77,2 millones de parámetros, una dimensión de modelo de 384, dos capas (L=2) y se entrena sobre OpenWebText con un presupuesto fijo de 532,48 millones de tokens.

Su relevancia es metodológica: emplea pre-registro de hipótesis, presupuesto de tokens igualado entre brazos y auditorías de causalidad, lo que lo convierte en una referencia útil para investigadores que estudian mecanismos de atención en arquitecturas no transformer. No está pensado para uso en producción ni para generación de texto de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo conservativo (energy-based) con potencial escalar aprendido, potencial de pares y canales de contexto, integrado por una capa CfC/BAOAB; campo de intercambio de tipo atención (8 cabezas de ancho 48) |
| Parametros totales | 77,2 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (entrenado con bloques de 512 tokens) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | CC BY 4.0 |
| Formato de pesos | PyTorch (pytorch); no se especifican safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo no es un transformer. Su base es un modelo conservativo en el que cada fuerza aplicada al estado es el gradiente exacto de un potencial: un potencial escalar aprendido Vθ, un potencial de pares Vφ y unos canales de contexto ξ, integrados mediante una capa de dinámica CfC/BAOAB. Sobre esa base se añade un campo de intercambio que, en cada capa, ejerce una fuerza sobre cada token procedente de los tokens anteriores, construida de forma análoga a la atención: proyecciones por cabeza de query, key y value (8 cabezas de 48 dimensiones), pesos de enrutamiento a partir del coseno de query y key multiplicado por una escala aprendida por cabeza, y una matriz de lectura de vuelta al estado. Los pesos de enrutamiento se mantienen fijos respecto al estado que se mueve, de modo que la fuerza sigue siendo el gradiente exacto de un potencial y el modelo permanece conservativo. El endurecimiento incluye queries y keys normalizadas, escala limitada a 100 y recorte de gradiente de 0,3; las escalas aprendidas quedaron entre 11,7 y 21,4, ninguna cerca del límite. Los 32 registros se construyen y escriben, con un término de repulsión entre ellos (coeficiente 0,05) durante el entrenamiento, pero nada los lee hacia los tokens, por lo que no pueden afectar a la predicción.

El entrenamiento usa OpenWebText con un presupuesto idéntico al resto de brazos de la familia: 32.500 pasos × 32 × 512 = 532.480.000 tokens, mismo corpus, tokenizer y lotes de validación. La ejecución se realizó en una única sesión de Colab, a 1,60 s/paso (14,5 horas), con 0 activaciones del watchdog y 0 picos; el 11,1% de los pasos registrados alcanzaron el recorte de gradiente (norma máxima 1,24, todos entre los pasos 11.600 y 27.950). El autor declara seis hipótesis pre-registradas antes del primer paso de entrenamiento, todas cumplidas. Las auditorías de causalidad (SCAF) dieron resultado limpio en las siete comprobaciones, con perturbación futura exactamente 0 y coste de fuga ≤ 8,4e-5 nats.

## Capacidades

- Generación de texto autoregresiva en inglés, a nivel de investigación y con calidad limitada (perplejidad de validación de 54,27 en OpenWebText a bloque 512).
- Modelado de lenguaje con dinámica conservativa: cada fuerza aplicada es el gradiente de un potencial, propiedad que puede verificarse numéricamente.
- Enrutamiento de tipo atención mediante campo de intercambio con cabezas múltiples y escalas aprendidas por cabeza.
- Comportamiento de copia e inducción: el autor mide un coste de servicio de 2,61 nats en posiciones de inducción (umbral 1,74), lo que indica cierta capacidad de copiar tokens previos.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo inglés.
- Capacidades especiales: modo de pensamiento, visión o audio no disponibles; el interés está en la ablación de mecanismos, no en capacidades de producto.

## Casos de uso

- Investigación sobre modelos conservativos: servir como brazo de control en estudios que comparan rutas de tipo atención dentro de modelos donde cada fuerza es un gradiente de potencial, permitiendo atribuir diferencias de perplejidad al mecanismo y no a otros factores.
- Ablación de mecanismos de atención: al ser idéntico a F3.1 salvo por el campo de intercambio, permite medir el efecto aislado de ese campo (6,0% de mejora en perplejidad) sin contaminación de otras variables.
- Reproducción de estudios pre-registrados: el modelo documenta seis predicciones fijadas antes del entrenamiento y su resultado, útil para quienes investigan prácticas de pre-registro en machine learning.
- Verificación de conservatividad: investigadores interesados en modelos energy-based pueden comprobar empíricamente que las fuerzas aplicadas derivan de un potencial y que el enrutamiento no rompe esa propiedad.
- Auditoría de causalidad: las comprobaciones SCAF con perturbación futura nula lo hacen adecuado como caso de estudio de fuga de información en arquitecturas no transformer.
- Estudio de sustitución entre mecanismos: la comparación con G2 y G3′ permite analizar si dos rutas de tipo atención son redundantes (el campo junto a los registros solo aporta un 0,4%).
- Docencia y divulgación: ejemplo compacto (77,2 M de parámetros, 0,6 GB de repositorio) de dinámica lagrangiana aplicada a modelado de lenguaje, ejecutable en una sola sesión de Colab.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente):

| Modelo | Perplejidad de validación (OpenWebText, bloque 512) | Relación con GPT-2 | Parámetros |
|---|---:|---:|---:|
| Este modelo (campo de intercambio, sin lectura de registros) | 54,27 | 1,090× | 77,2 M |
| G3′ (este modelo con ruta de registros) | 52,90 | 1,062× | 77,4 M |
| G2 (ruta de registros en lugar del campo) | 53,12 | 1,066× | 76,8 M |
| F3.1 (este modelo sin el campo) | 57,76 | 1,160× | 76,6 M |
| Brazo gpt2-matched (L=8) | 49,81 | 1,000× | 33,7 M |

Detalles de la medición: la perplejidad "settled" es la media de las tres últimas evaluaciones (54,20, 54,39, 54,22); la mejor fue 52,50 en el paso 31.000 y la final 54,22. Las evaluaciones consecutivas al final difieren en torno a ±1 punto de perplejidad. En el paso 3.000 el modelo marcaba 114,76, frente a 113,52 de G3′ y 127,73 de F3.1. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de tareas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 77,2 M de parámetros en precisión de 32 bits los pesos ocupan aproximadamente 0,31 GB, y en 16 bits unos 0,15 GB, a lo que hay que sumar el estado de la dinámica y los 32 registros.
- GPU recomendadas: no especificadas; el entrenamiento se ejecutó en una única sesión de Colab, lo que sugiere que la inferencia cabe en GPU de consumo.
- GPU de consumo: con ese tamaño de pesos, cualquier GPU con 4 GB o más de VRAM debería poder alojarlo, aunque el autor no publica requisitos oficiales.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el repositorio es PyTorch puro y la arquitectura no es transformer, por lo que los motores de inferencia estándar no son aplicables sin trabajo adicional.
- Latencia y throughput: no disponibles para inferencia; el entrenamiento corrió a 1,60 s/paso con lotes de 32 secuencias de 512 tokens.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad (OWT, bloque 512) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| Este modelo | 77,2 M | No disponible | 54,27 | CC BY 4.0 | Hugging Face |
| G3′ (misma familia, con registros) | 77,4 M | No disponible | 52,90 | CC BY 4.0 | Hugging Face |
| F3.1 (misma familia, sin campo) | 76,6 M | No disponible | 57,76 | CC BY 4.0 | Hugging Face |
| gpt2-matched (L=8) | 33,7 M | No disponible | 49,81 | No disponible | Hugging Face |

La comparación relevante es interna a la familia SemSimula, ya que el autor no ofrece comparaciones con modelos de propósito general. Frente al brazo gpt2-matched, este modelo presenta una perplejidad un 9,0% peor con más del doble de parámetros, lo que refleja su carácter exploratorio. No se dispone de comparaciones con alternativas externas de la misma categoría (modelos conservativos o energy-based de tamaño similar) en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de producción: el propio autor lo describe como un instrumento de medición exploratorio para estudiar mecanismos de atención, no como una arquitectura propuesta.
- Calidad de lenguaje limitada: una perplejidad de 54,27 en OpenWebText a bloque 512 está muy lejos de los modelos actuales y condiciona cualquier uso generativo real.
- Solo inglés: no hay soporte multilingüe declarado.
- Longitud de contexto: entrenado con bloques de 512 tokens; no se documenta una ventana de contexto mayor ni su comportamiento más allá de esa longitud.
- Riesgo de alucinación: no evaluado en la información disponible; con esta perplejidad, la generación libre de texto extenso sería poco fiable.
- Sesgos: no se documentan evaluaciones de sesgo; el corpus OpenWebText hereda los sesgos de los enlaces de Reddit.
- Restricciones de licencia: CC BY 4.0 permite uso comercial con atribución, pero el modelo no está diseñado ni validado para ello.
- Ausencia de verificación independiente: los resultados de benchmarks están marcados como no verificados y proceden del propio autor.
- Detalles de infraestructura: el entrenamiento se realizó en una sola sesión de Colab, con un 11,1% de pasos que alcanzaron el recorte de gradiente, lo que puede afectar a la estabilidad de la optimización.
- Compatibilidad: al no ser transformer, no es directamente desplegable en los motores de inferencia habituales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-attention-potential-rfqk-norc
- Modelo base F3.1: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc
- Variante G3′ con ruta de registros: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-attention-potential-rfqk
- Variante G2: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none
- Brazo gpt2-matched: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-gpt2-matched
- Colección Gen 3: https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-cfc-baoab-live-gradients-6abf371ea3c83f127057020c
- Dataset OpenWebText: https://huggingface.co/datasets/Skylion007/openwebtext
- Paper, blog, repositorio de código y demos: no disponibles en la información proporcionada.
