# migi-null/DeepGPS-3D

## Resumen

DeepGPS-3D es un modelo generativo de difusion condicional en 3D desarrollado por el usuario migi-null (repositorio de codigo asociado: royal-dargon/DeepGPS_3D). Su objetivo es predecir el volumen tridimensional de localizacion subcelular de una proteina a partir de dos entradas: un volumen nuclear 3D emparejado (condicion espacial) y el embedding de secuencia de la proteina calculado con ESM2-650M. Resuelve, por tanto, un problema de biologia celular computacional: inferir la distribucion espacial de una proteina dentro de la celula sin necesidad de microscopia directa de esa proteina.

Tecnicamente se trata de un DDPM (denoising diffusion probabilistic model) con 1000 pasos de ruido lineal, cuyo backbone es una U-Net 3D condicional con anchos de canal 32/64/128/256, dos bloques residuales por nivel y atencion de 8 cabezas en el cuello de botella. Trabaja sobre volumenes de 64 x 144 x 144 voxeles y utiliza muestreo inverso con guiado libre de clasificador (guidance 3.0 por defecto). Este checkpoint concreto (best_model.pth, ~185 MB) corresponde al modelo baseline publicado como pesos preentrenados.

Es relevante ahora porque combina dos lineas activas: los modelos de difusion aplicados a imagenes cientificas 3D y el uso de embeddings de modelos de lenguaje de proteinas (ESM2) como condicionamiento estructurado. Ademas, sirve como backbone generativo para tareas derivadas del repositorio, como la prediccion de localizacion de mutantes y la prediccion de interacciones proteina-proteina basada en imagen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DDPM condicional con backbone 3D U-Net (canales 32/64/128/256, 2 bloques residuales por nivel, atencion de 8 cabezas en el cuello de botella) |
| Parametros totales | no disponible (checkpoint de ~185 MB en best_model.pth) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de difusion sobre volumenes 3D de 64 x 144 x 144 voxeles) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch state dict (.pth) |
| Pasos de difusion | 1000 pasos lineales, beta de 1e-4 a 0.02 |
| Condicionamiento de secuencia | embedding ESM2-650M (facebook/esm2_t33_650M_UR50D) de 1.280 dimensiones, inyectado en cada escala de la U-Net |
| Guiado en muestreo | classifier-free guidance, valor por defecto 3.0 |

## Arquitectura y entrenamiento

El modelo implementa un proceso de difusion DDPM con 1000 pasos de ruido con schedule lineal (beta de 1e-4 a 0.02). La red de denoising es una U-Net 3D condicional que recibe dos canales espaciales de entrada (el volumen de proteina ruidoso y el volumen nuclear como condicion) y produce como salida la prediccion del ruido para un unico canal de proteina. La condicion de secuencia se aporta mediante un embedding precomputado de ESM2-650M de 1.280 dimensiones, que se inyecta en todas las escalas de la U-Net. El muestreo se realiza mediante difusion inversa con guiado libre de clasificador, manteniendo las condiciones de nucleo y secuencia durante todo el proceso.

El entrenamiento se realizo sobre volumenes confocales de OpenCell con una particion disjunta por proteina: 114.855 imagenes de entrenamiento (1.048 proteinas), 14.280 de validacion (131 proteinas) y 14.282 de test (131 proteinas). Se uso el optimizador AdamW con learning rate 1e-4, tamano de lote efectivo 12 (lote 6 x acumulacion de gradiente 2), hasta 50 epocas y semilla 42. No se menciona en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion por preferencias, algo esperable en un modelo de difusion cientifica. Como innovacion destacable, la combinacion de condicionamiento espacial (nucleo) con condicionamiento por embedding de proteina en un espacio 3D completo, en lugar de una clasificacion de clase unica de localizacion.

## Capacidades

- Generacion de volumenes 3D de localizacion subcelular de proteinas condicionados por un volumen nuclear y por el embedding de secuencia ESM2-650M.
- Muestreo de distribuciones 3D mediante difusion inversa con guiado libre de clasificador ajustable (guidance 3.0 por defecto).
- Captura de la organizacion axial gruesa y de estructura voxel/radial moderada del patron de localizacion.
- Uso como backbone generativo para tareas derivadas del repositorio: prediccion de localizacion de variantes mutantes y prediccion de interacciones proteina-proteina basada en imagen.
- Inferencia en GPU CUDA mediante el script `src.demo_infer` del repositorio, y carga de pesos en CPU para inspeccion o carga del modelo.
- No dispone de tool calling, function calling, razonamiento multi-paso en lenguaje natural, capacidades multilingues ni modo de pensamiento; no es un modelo de lenguaje.

## Casos de uso

- Investigacion en localizacion subcelular: dado un volumen nuclear confocal y la secuencia de una proteina, generar el volumen 3D esperado de localizacion para comparar hipotesis entre proteinas o condiciones experimentales.
- Analisis de variantes mutantes: utilizar el modelo como backbone generativo para predecir como cambia el patron de localizacion cuando se introduce una mutacion en la secuencia, aprovechando el condicionamiento por embedding ESM2.
- Priorizacion de experimentos de microscopia: generar predicciones para proteinas no medidas y seleccionar las candidatas mas informativas antes de invertir tiempo de adquisicion en el microscopio.
- Prediccion de interacciones proteina-proteina basada en imagen: emplear los volumenes generados como entrada de los modulos downstream del repositorio para estimar colocalizacion o proximidad entre proteinas.
- Aumento de datos sinteticos: producir volumenes de localizacion plausibles para aumentar conjuntos de entrenamiento de otros modelos de vision celular, siempre que se validen contra datos reales.
- Formacion y divulgacion: usar el demo de inferencia sobre el ejemplo WASL incluido en el repositorio para ilustrar como funciona un modelo de difusion 3D aplicado a biologia celular.
- Analisis de arquitectura nuclear como condicion: estudiar hasta que punto la morfologia del nucleo determina la organizacion espacial de la proteina, variando la condicion nuclear manteniendo fija la secuencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe cualitativamente que el modelo reproduce bien la organizacion axial gruesa y la estructura voxel/radial moderada, y que captura senal de localizacion en lugar de reconstruccion exacta de celula unica, pero no proporciona metricas numericas, intervalos de confianza ni comparaciones cuantitativas con otros metodos.

## Requisitos de hardware

- El checkpoint ocupa aproximadamente 185 MB, por lo que los pesos en precision completa (fp32) caben holgadamente en cualquier GPU con al menos 2 GB de VRAM.
- La VRAM real de inferencia esta dominada por las activaciones de la U-Net 3D sobre volumenes de 64 x 144 x 144 voxeles (aproximadamente 1,33 millones de voxeles por canal). Una estimacion orientativa razonable es de 4 a 8 GB de VRAM para inferencia, aunque no se dispone de una cifra oficial publicada.
- Cabe en GPU de consumo: se espera que funcione en tarjetas tipo RTX 3060 12 GB, RTX 4070, RTX 4080 y RTX 4090. No se ha confirmado en la informacion disponible el funcionamiento en GPUs con menos de 8 GB.
- El script de demo del repositorio admite `--device cuda`; se puede cargar el modelo en CPU (`map_location="cpu"`) para inspeccion, aunque el muestreo completo de 1000 pasos en CPU seria muy lento.
- Opciones de despliegue documentadas: script propio `src.demo_infer` del repositorio DeepGPS_3D y carga directa en PyTorch mediante `get_diffusion_model` mas `load_state_dict`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El coste esta dominado por los 1000 pasos de difusion inversa por muestra.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada. La model card no incluye comparaciones con alternativas. Como referencia de contexto, el campo de la prediccion de localizacion de proteinas incluye clasificadores de localizacion y metodos de imagen, pero no se aportan parametros, contexto ni rendimiento de ninguno de ellos en la informacion disponible, por lo que no es posible construir una comparativa rigurosa.

| Aspecto | DeepGPS-3D (baseline) | Alternativas comparables |
|---|---|---|
| Parametros | no disponible (~185 MB de checkpoint) | no disponible |
| Contexto / entrada | volumen nuclear 64 x 144 x 144 + embedding ESM2 de 1.280 d | no disponible |
| Tipo de salida | volumen 3D generado (1 canal de proteina) | no disponible |
| Rendimiento | no se han publicado metricas | no disponible |
| Licencia | MIT | no disponible |
| Disponibilidad | pesos en HuggingFace y codigo en GitHub | no disponible |

## Limitaciones y advertencias

- El propio autor indica que el modelo captura senal de localizacion, no una reconstruccion exacta de celula unica; reproduce bien la organizacion axial gruesa y la estructura voxel/radial moderada.
- Esta entrenado sobre una unica particion de OpenCell, lo que limita la generalizacion a otras lineas celulares, microscopios o protocolos de adquisicion.
- Reporta estimaciones puntuales sin intervalos de confianza, por lo que no cuantifica la incertidumbre de la prediccion.
- Uso previsto exclusivamente de investigacion; el autor indica explicitamente que no es apto para uso clinico.
- No se documentan sesgos especificos, pero al derivarse de un unico dataset experimental puede heredar sesgos de composicion de proteinas, condiciones de cultivo y sesgo de seleccion de OpenCell.
- No se dispone de informacion sobre cuantizacion, por lo que no hay una ruta documentada para reducir el consumo de memoria mas alla del checkpoint original.
- No es un modelo de lenguaje: no soporta generacion de texto, codigo, tool calling ni razonamiento conversacional.
- La licencia MIT permite uso comercial y modificacion, pero conviene revisar tambien las condiciones de uso de los datos OpenCell y del modelo ESM2 empleado para generar los embeddings.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que sugiere validacion comunitaria muy limitada y ausencia de replicaciones independientes.

## Enlaces

- HuggingFace: https://huggingface.co/migi-null/DeepGPS-3D
- Codigo y uso: https://github.com/royal-dargon/DeepGPS_3D
- Modelo de embeddings de secuencia: https://huggingface.co/facebook/esm2_t33_650M_UR50D
- Dataset de referencia (OpenCell): no disponible en la informacion proporcionada
- Paper asociado: no disponible en la informacion proporcionada
- Demo publica: no disponible en la informacion proporcionada
