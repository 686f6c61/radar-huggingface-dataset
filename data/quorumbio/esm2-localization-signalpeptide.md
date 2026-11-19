# quorumbio/esm2-localization-signalpeptide

## Resumen

`quorumbio/esm2-localization-signalpeptide` es un modelo de clasificación de proteínas desarrollado por quorumbio, obtenido mediante fine-tuning del modelo de lenguaje de proteínas `facebook/esm2_t30_150M_UR50D`. Dada una secuencia de aminoácidos, devuelve dos predicciones: un vector de probabilidades para 10 localizaciones subcelulares (multietiqueta, ya que una proteína puede residir en más de un compartimento) y la probabilidad de que la proteína presente un péptido señal en el extremo N-terminal. Resuelve un problema clásico de anotación funcional en bioinformática: inferir el destino celular de una proteína a partir únicamente de su secuencia.

El modelo parte de un transformer ESM-2 de 150M parámetros (148.146.548 reales según los pesos en safetensors) y añade dos cabezas de clasificación sobre las representaciones pooled del encoder. El entrenamiento se realizó sobre UniProtKB/Swiss-Prot con un split reducido por homología (MMseqs2 al 30% de identidad), lo que reduce la fuga de información entre train y test. Es relevante porque ofrece una alternativa ligera, con licencia Apache 2.0 y exportable a ONNX int8 (149.9 MB), para pipelines de anotación proteica que no quieren depender de herramientas propietarias o de pesos no abiertos.

La detección de péptido señal es el punto fuerte del modelo (AUROC 0.994, MCC 0.956), mientras que la predicción de localización es sólida en compartimentos frecuentes (núcleo, citoplasma, extracelular, plastidio) y claramente débil en Golgi, lisosoma/vacuola y peroxisoma. El autor lo declara explícitamente como modelo de uso en investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder ESM-2 (esm2_t30_150M_UR50D) con cabezas de clasificación sobre features mean-pooled |
| Parametros totales | 148.146.548 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens de entrada; `predict` trunca secuencias de más de 1000 residuos conservando los primeros 600 y los últimos 400 |
| Tipos de cuantizacion | fp32 (ONNX, 591.7 MB) e int8 (ONNX quantized, 149.9 MB); pesos PyTorch en safetensors |
| Idiomas soportados | no disponible (modelo de secuencias proteicas, no de lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX (fp32 e int8), transformers |

## Arquitectura y entrenamiento

El modelo reutiliza el encoder ESM-2 de 150M parámetros (30 capas, representación de proteínas por token) y descarta la cabeza de masked language modeling original. Sobre la representación mean-pooled de la secuencia se aplica una cabeza lineal de 10 salidas para localización; la cabeza de péptido señal recibe además la media de los primeros 30 residuos, un sesgo inductivo razonable dado que la señal N-terminal se localiza en ese tramo. La localización se formula como clasificación multietiqueta con sigmoide y binary cross-entropy con pesos de clase (máximo 10) para compensar el desbalance de las clases raras.

Los datos provienen de UniProtKB/Swiss-Prot (entradas revisadas, recuperadas el 2026-11-17), filtrando proteínas de 30 a 4000 residuos con aminoácidos estándar y al menos una localización respaldada por evidencia experimental (ECO:0000269), mapeadas por nombre a 10 clases. La etiqueta de péptido señal se asigna si la entrada tiene un feature SIGNAL de cualquier tipo de evidencia, por lo que puede incluir anotaciones predichas. El clustering con MMseqs2 al 30% de identidad (cobertura 0.8) genera un split 80/10/10 y se eliminan del dev y test las proteínas con cualquier hit al 30% o más de identidad contra train. Tamaños finales: 30.134 de train, 2.457 de dev y 2.336 de test, con 5.636, 385 y 450 positivos de péptido señal respectivamente.

El entrenamiento usó bf16, gradient checkpointing, AdamW con warmup y decaimiento lineal, batch size 8, learning rate 5e-05 y 2 épocas (conservando la mejor época en dev), en una única RTX 3060 durante unos 99 minutos. No se reportan RLHF, DPO ni técnicas de alineación; es un fine-tuning supervisado convencional. Los scripts y el `provenance.json` con checksums de los datos están en el directorio `training/` del repositorio.

## Capacidades

- Predicción multietiqueta de 10 localizaciones subcelulares: núcleo, citoplasma, extracelular, mitocondria, membrana celular, retículo endoplasmático, plastidio, Golgi, lisosoma/vacuola y peroxisoma.
- Cada localización se devuelve con probabilidad y decisión binaria mediante umbrales por clase ajustados en el conjunto de validación.
- Predicción binaria de péptido señal N-terminal con probabilidad calibrada (umbral reportado de 0.9).
- Manejo de secuencias largas mediante truncado controlado (primeros 600 + últimos 400 residuos).
- Exportación a ONNX con paridad verificada frente a PyTorch: diferencia máxima absoluta de probabilidad de 9.2e-06 en fp32 y 0.100 en int8, con coincidencia de decisiones del 100.0% (fp32) y 99.9% (int8) sobre 150 secuencias de test de hasta 500 residuos.
- No soporta tool calling, agentes, visión, audio ni generación de texto: es un clasificador de secuencias, no un modelo generativo.
- Capacidades multilingües no aplicables; el alfabeto de entrada son los 20 aminoácidos estándar (más tokens especiales de ESM-2).

## Casos de uso

- Anotación funcional a gran escala de proteomas: procesar decenas de miles de secuencias con la versión ONNX int8 para asignar una primera hipótesis de localización antes de la revisión manual, usando las probabilidades como ranking de prioridad.
- Priorización de dianas en drug discovery: filtrar candidatos según localización esperada (por ejemplo, descartar proteínas predichas como nucleares cuando se busca una diana de superficie) antes de ensayos experimentales.
- Detección de péptidos señal en pipelines de secreción recombinante: el AUROC 0.994 y el MCC 0.956 a umbral 0.9 permiten cribar bibliotecas de variantes para identificar secuencias con alta probabilidad de secreción.
- Enriquecimiento de bases de datos internas: combinar las predicciones con anotaciones existentes para señalar entradas con localización desconocida o contradictoria y dirigir la curaduría.
- Filtrado previo en estudios de proteómica espacial: usar la localización predicha para validar o descartar asignaciones de compartimento en experimentos de fraccionamiento celular.
- Docencia y prototipado bioinformático: el modelo cabe en una GPU de consumo y se carga con `transformers` u ONNX Runtime, lo que facilita demostraciones y pipelines educativos sin infraestructura dedicada.
- Señal de entrada en modelos mayores: usar las probabilidades de localización y péptido señal como features adicionales en un clasificador downstream o en un sistema de anotación combinado con otras herramientas.

## Benchmarks y rendimiento

Resultados sobre el conjunto de test (2.336 proteínas de Swiss-Prot, split por similitud de secuencia, una sola ejecución y una sola semilla, sin intervalos de confianza).

Péptido señal (450 positivos de 2.336): AUROC 0.994, MCC 0.956 con umbral 0.9.

Localización (macro AUROC 0.926, macro F1 0.650). El autor advierte que el AUROC es engañoso en clases raras y recomienda mirar AP y F1. La última columna es la versión ESM-2 35M de la misma receta, como referencia.

| Clase | Positivos en test | AUROC | AP | F1 | F1 (35M) |
|---|---|---|---|---|---|
| Nucleo | 716 | 0.929 | 0.874 | 0.785 | 0.769 |
| Citoplasma | 842 | 0.899 | 0.820 | 0.779 | 0.763 |
| Extracelular | 351 | 0.977 | 0.892 | 0.861 | 0.840 |
| Mitocondria | 221 | 0.931 | 0.773 | 0.737 | 0.701 |
| Membrana celular | 295 | 0.924 | 0.728 | 0.693 | 0.680 |
| Retículo endoplasmático | 192 | 0.932 | 0.619 | 0.630 | 0.521 |
| Plastidio | 84 | 0.980 | 0.884 | 0.883 | 0.859 |
| Golgi | 78 | 0.885 | 0.381 | 0.342 | 0.311 |
| Lisosoma/vacuola | 88 | 0.879 | 0.367 | 0.361 | 0.299 |
| Peroxisoma | 35 | 0.922 | 0.405 | 0.432 | 0.296 |

El autor indica que estas cifras no son directamente comparables con herramientas publicadas como SignalP o DeepLoc, que usan otros datasets, splits y definiciones de etiqueta, y que no las ha ejecutado sobre este conjunto de test.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 0.6-0.8 GB para los pesos más activaciones de secuencias cortas; con secuencias cercanas al límite de contexto la huella de activaciones crece de forma notable.
- VRAM estimada en int8 ONNX: aproximadamente 150-400 MB, adecuada para CPU y GPUs de gama baja.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para fp32 en secuencias cortas; RTX 3060, RTX 4090, A100 o H100 sobran para este tamaño. El propio autor entrenó en una RTX 3060.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna de consumo, e incluso en CPU con la versión int8.
- Opciones de despliegue: `transformers` (PyTorch), ONNX Runtime con los ficheros `onnx/model.onnx` y `onnx/model_quantized.onnx`, y el wrapper `quorum_loc` incluido en el repositorio (`load`, `predict`). No se documenta soporte para vLLM, TGI ni llama.cpp, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles de forma explícita; el autor solo indica que la versión int8 es "más pequeña y rápida" que la fp32, sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| quorumbio/esm2-localization-signalpeptide | 148M | 1024 tokens | Localización (10 clases) + péptido señal | Apache 2.0 | Hugging Face, ONNX fp32/int8 |
| Versión ESM-2 35M de la misma receta (referencia del autor) | ~35M | no disponible | Localización + péptido señal | no disponible | no disponible en esta ficha |
| SignalP | no disponible | no disponible | Péptido señal | no disponible | herramienta publicada, no ejecutada sobre este test |
| DeepLoc | no disponible | no disponible | Localización subcelular | no disponible | herramienta publicada, no ejecutada sobre este test |

El autor advierte explícitamente que las cifras de SignalP y DeepLoc no son comparables con las suyas por diferencias en datasets, splits y definición de etiquetas, y que no ha ejecutado esas herramientas sobre su conjunto de test. Cualquier comparación numérica directa sería inválida.

## Limitaciones y advertencias

- Rendimiento débil en Golgi (F1 0.342), lisosoma/vacuola (0.361) y peroxisoma (0.432); mediocre en retículo endoplasmático (0.630) y membrana celular (0.693). No conviene apoyar decisiones en esas clases.
- Las etiquetas provienen de anotaciones curadas, incompletas y a veces inconsistentes; las proteínas con localización desconocida o contestada no están representadas, lo que sesga el modelo hacia proteínas bien estudiadas.
- Solo 10 localizaciones gruesas: no hay subcompartimentos, topología de membrana ni sitio de corte del péptido señal.
- Las localizaciones específicas de isoformas y dependientes de condición se fusionan por proteína.
- La etiqueta de péptido señal admite features SIGNAL de cualquier tipo de evidencia, incluidas anotaciones predichas, lo que puede introducir ruido.
- Una sola ejecución de entrenamiento, una sola semilla y sin intervalos de confianza; el checkpoint y los umbrales se eligieron solo en validación.
- La cuantización int8 no es idéntica a fp32 (diferencia máxima de probabilidad de 0.100 y 99.9% de coincidencia en decisiones) y su precisión solo se comprobó sobre 150 secuencias, no sobre el test completo.
- El truncado de secuencias largas (primeros 600 + últimos 400 residuos) descarta la región central y puede perder señales relevantes.
- Uso declarado solo para investigación; aunque la licencia es Apache 2.0, el autor no valida su uso en producción ni en decisiones clínicas.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de falsos positivos y negativos con probabilidades mal calibradas en clases raras.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/quorumbio/esm2-localization-signalpeptide
- Modelo base: https://huggingface.co/facebook/esm2_t30_150M_UR50D
- UniProtKB/Swiss-Prot: https://www.uniprot.org/
- MMseqs2: https://github.com/soedinglab/MMseqs2
- Documentación de ESM-2 en transformers: https://huggingface.co/docs/transformers/model_doc/esm
- Paper de ESM-2 (Lin et al., 2023): https://www.science.org/doi/10.1126/science.ade2574
- SignalP: https://services.healthtech.dtu.dk/services/SignalP-6.0/
- DeepLoc: https://services.healthtech.dtu.dk/services/DeepLoc-2.0/
