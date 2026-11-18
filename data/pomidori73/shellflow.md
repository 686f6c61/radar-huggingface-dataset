# pomidori73/ShellFlow

## Resumen

ShellFlow es una familia de modelos generativos de eventos de colisión del LHC desarrollada por Midori Kato, Kevin A. Urquía-Calderón, Inar Timiryasov y Oleg Ruchayskiy, y publicada junto al artículo *Learning Standard Model structure from LHC data with Riemannian flow matching* (arXiv:2607.16144). No es un modelo de lenguaje: es un generador de cinemática de partículas que aprende la estructura del Modelo Estándar directamente a partir de datos abiertos de ATLAS, sin imponer simetrías físicas de forma explícita.

El modelo se entrena con *Riemannian flow matching* sobre una variedad producto (R × S², más una coordenada log-masa para objetos masivos), lo que restringe las trayectorias generativas a la variedad física de cada partícula (dirección en la esfera y módulo del momento). La arquitectura es un transformer pequeño de 3,0 M de parámetros (d_model 128, 6 capas, 4 cabezas), condicionado por la composición del evento (tipos de partícula, cargas, extras del detector y MET).

El repositorio contiene cinco checkpoints del artículo principal (modelo principal y cuatro ablaciones E1) más dos redes del artículo de *steering* (ShellFlow-B y ShellGATr). Es relevante para la comunidad de física de altas energías porque demuestra que un modelo generativo de tamaño reducido puede reproducir correlaciones del Modelo Estándar (incluida la reconstrucción del bosón Z) sin sesgos inductivos de simetría, y porque publica pesos, código y ablaciones de forma abierta bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (DiT) con flow matching riemanniano sobre variedad producto R × S² (+ log-masa); backbone `legacy_type_film` |
| Parametros totales | 3,0 M (modelo principal y ablaciones E1); ShellFlow-B 3.016.837; ShellGATr 3.087.498 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 8 partículas reconstruidas por evento (N ≤ 8) |
| Tipos de cuantizacion | no disponible (checkpoints PyTorch Lightning en fp32; no se publican variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch Lightning `.ckpt` (pesos + pesos EMA + hiperparámetros; estado del optimizador eliminado) |

## Arquitectura y entrenamiento

El backbone es un transformer de tipo DiT con 6 capas, dimensión 128 y 4 cabezas de atención, condicionado por tipo de partícula, carga, 13 características extras del detector y, opcionalmente, el vector de energía transversa faltante (MET). La innovación central es el esquema de flow matching: en lugar de generar las cuatro componentes (px, py, pz, E) en espacio euclídeo, el modelo interpola sobre la variedad física de cada objeto (dirección en S² y módulo del momento, más log-masa para objetos masivos), de modo que las muestras generadas respetan por construcción las restricciones cinemáticas. Se incluye una cabeza auxiliar (aux head) que las ablaciones E1-V2 y E1-V3 desactivan para medir su contribución.

El modelo principal se entrenó sobre la unión de los *skims* `1LMET30` y `2to4lep` de ATLAS Open Data (eventos con ≤ 8 partículas reconstruidas, deduplicados por número de run/evento), durante 30 épocas y 717.210 pasos. Las ablaciones E1 se entrenaron 2 épocas (48k pasos) para comparar variantes manifold vs. euclídea y con/sin cabeza auxiliar. ShellFlow-B y ShellGATr se entrenaron solo con `2to4lep` (268 M eventos) durante 100 épocas y 1.636.500 pasos; ShellGATr sustituye el backbone por bloques L-GATr-slim equivariantes de Lorentz (32 vectores y 96 escalares por token). El checkpoint principal almacenado corresponde a la última época (epoch 29), no al de menor pérdida de validación (epoch 26, `val/loss/total` = 1,1685).

## Capacidades

- Generación de cinemática de eventos del LHC: produce cuadrivectores (px, py, pz, E) en GeV para hasta 8 partículas por evento.
- Generación condicionada por composición del evento: tipos de partícula {0=pad, 1=jet, 10=largeRjet, 11=e, 13=mu, 15=tau, 22=photon}, carga {0,1,2} y extras del detector.
- Condicionamiento opcional por MET (vector de 2 componentes).
- Modelado de objetos masivos mediante coordenada log-masa adicional.
- Reproducción de estructura del Modelo Estándar (correlaciones cinemáticas, reconstrucción del bosón Z) sin imponer simetrías explícitas.
- Variante equivariante de Lorentz (ShellGATr) para comparación arquitectónica.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Generación rápida de eventos para análisis de física: sustituir o complementar simuladores completos (Geant4, Pythia) en estudios de aceptancia y eficiencia donde se necesita un volumen alto de eventos con cinemática realista y coste computacional mínimo (3 M de parámetros).
- Aumento de datos para entrenamiento de clasificadores: generar eventos sintéticos condicionados por composición para equilibrar clases poco frecuentes en análisis de ATLAS Open Data.
- Estudios de inferencia estadística: usar el modelo como densidad generativa para calcular verosimilitudes aproximadas o comparar distribuciones observadas frente a generadas.
- Validación de metodologías de *flow matching* en variedades: banco de pruebas reproducible con ablaciones publicadas (manifold vs. euclídeo, con/sin cabeza auxiliar) para investigadores de ML geométrico.
- Interpretabilidad y *steering* de redes neuronales: los modelos ShellFlow-B y ShellGATr del artículo de *Discovering Z Bosons Inside of a Neural Network* permiten estudiar qué estructuras físicas emergen en las representaciones internas.
- Docencia y divulgación en física de partículas: generar eventos sintéticos de ejemplo con cuadrivectores plausibles para ilustrar reconstrucción de resonancias y cinemática relativista.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card referencia el artículo arXiv:2607.16144 y el artículo de *steering* (enlace pendiente) para los resultados cuantitativos, pero no incluye tablas de métricas en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para el backbone de 3 M de parámetros; el cuello de botella es el número de pasos de generación (200 en el ejemplo de la model card), no la memoria.
- GPU recomendadas: cualquier GPU con soporte CUDA, incluidas GTX 1060, RTX 3060 o superiores; también es viable en CPU para lotes pequeños.
- Cabe holgadamente en GPU de consumo: sí, en cualquier GPU consumer moderna.
- Opciones de despliegue: PyTorch + PyTorch Lightning con el paquete `shellflow` del repositorio de GitHub; no se publican integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponible en la información proporcionada; dependen del número de pasos de integración del ODE y del tamaño de lote.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / partículas | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ShellFlow (este) | 3,0 M | ≤ 8 partículas | Flow matching riemanniano en R × S² | MIT | Pesos en HF + código en GitHub |
| ShellGATr (incluido) | 3,09 M | ≤ 8 partículas | Flow matching con bloques L-GATr equivariantes de Lorentz | MIT | Pesos en HF + código con extra `gatr` |
| Simuladores Monte Carlo (Pythia, Herwig) | no aplicable | eventos completos | Simulación física basada en reglas y amplitudes | GPL u otras | Ampliamente disponibles |
| Generadores neuronales de eventos a gran escala | no disponible en la información | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con generadores neuronales alternativos; la comparación con simuladores Monte Carlo es cualitativa (ShellFlow no modela hadronización ni interacciones del detector).

## Limitaciones y advertencias

- Ámbito restringido: solo genera eventos con ≤ 8 partículas reconstruidas y sobre los *skims* `1LMET30` y `2to4lep` de ATLAS Open Data; no es un generador de eventos completos ni modela hadronización, *showering* ni respuesta del detector.
- El checkpoint principal almacenado es el de la última época (29), no el de menor pérdida de validación (época 26); los resultados del artículo usan los pesos EMA, no los pesos brutos.
- La coincidencia de distribución (*distribution matching*) está desactivada en los hiperparámetros almacenados para permitir la carga sin dataset; según el autor no afecta a la generación, pero conviene verificarlo en producción.
- Riesgo de sesgo respecto a los datos de ATLAS: el modelo aprende las distribuciones y selecciones del detector y de los *skims*, por lo que hereda sus sesgos e ineficiencias.
- Riesgo de alucinación en sentido físico: puede generar configuraciones cinemáticamente válidas pero no físicas; no se han publicado métricas de validez física en la información disponible.
- Requiere el paquete `shellflow` y, para ShellGATr, el extra `gatr`; los checkpoints no son autocontenidos fuera de ese ecosistema.
- Licencia MIT: permite uso comercial, pero se recomienda citar el artículo y revisar las condiciones de los datos de ATLAS Open Data subyacentes.
- Sin soporte de idiomas, tool calling ni agentes: cualquier uso fuera de generación de eventos de física de partículas no está contemplado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pomidori73/ShellFlow
- Artículo principal (arXiv:2607.16144): https://arxiv.org/abs/2607.16144
- Código: https://github.com/pomidori/ShellFlow
- Artículo de *steering* (*Discovering Z Bosons Inside of a Neural Network*): enlace pendiente según la model card
- ATLAS Open Data: no disponible en la información proporcionada
