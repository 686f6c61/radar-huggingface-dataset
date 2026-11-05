# Fatih162/se-primer-panic-onnx

## Resumen

`Fatih162/se-primer-panic-onnx` es un clasificador tabular muy ligero publicado en HuggingFace por el usuario Fatih162, orientado a la predicción de estados de "pánico" o sobrecarga cognitiva en un simulador educativo de ingeniería del software. No es un modelo de lenguaje ni una red neuronal profunda: se trata de un `Pipeline` de scikit-learn compuesto por un `StandardScaler` seguido de una `LogisticRegression` con `random_state=42`, exportado a formato ONNX (opset 17) para su ejecución tanto en Python como en navegador mediante `onnxruntime-web`.

El modelo resuelve un problema muy acotado: dado un vector de seis variables de telemetría del jugador (nivel, número de escena, tiempo de decisión, número de cambios de opción, número de clics en pistas y error en la etapa anterior), devuelve la probabilidad de que el usuario esté en un estado de crisis. Su relevancia práctica es limitada fuera de ese contexto, pero resulta interesante como ejemplo de despliegue de inferencia tabular en el cliente (WebAssembly) con un modelo de tamaño despreciable.

La información pública disponible es muy escasa: el repositorio ocupa 0.0 GB, no tiene descargas ni likes, no declara licencia, idiomas ni datos de entrenamiento. La model card está redactada en turco y describe el modelo como un componente pedagógico de apoyo dentro de un simulador interactivo, no como un sistema clínico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline scikit-learn: `StandardScaler` → `LogisticRegression(random_state=42)`, exportado a ONNX (opset 17) |
| Parametros totales | No disponible (modelo lineal con 6 features de entrada; el número exacto de coeficientes no se publica, pero es del orden de decenas) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo tabular, entrada de 6 features float32) |
| Tipos de cuantizacion | No disponible (ONNX estándar, sin cuantizaciones publicadas) |
| Idiomas soportados | No disponible (no procesa texto) |
| Licencia | No disponible |
| Formato de pesos | ONNX (opset 17, `zipmap=False`, tensor plano); el repo declara `library_name: sklearn` y tag `joblib` |

## Arquitectura y entrenamiento

La arquitectura es un clasificador lineal binario precedido de estandarización de features. El pipeline se compone de `StandardScaler` (normalización z-score de las seis variables de entrada) y `LogisticRegression`, un modelo lineal que aprende un hiperplano de separación entre los estados "normal" y "pánico/sobrecarga". El resultado se exporta a ONNX con opset 17, `zipmap=False` y salida como tensor plano de probabilidades, lo que permite consumirlo desde `onnxruntime` en Python y desde `onnxruntime-web` en el navegador.

No se especifica en la información disponible el volumen de datos de entrenamiento, la composición del dataset, si hubo balanceo de clases ni si se aplicaron técnicas de regularización más allá de las propias de `LogisticRegression`. El autor declara métricas perfectas (accuracy, ROC-AUC, F1, precisión y recall = 1.0) sobre un 30 % de test independiente, junto con umbrales de aceptación (accuracy mínima 0.8, ROC-AUC mínima 0.82, tolerancia de paridad 0.0001). Estas cifras deben interpretarse con cautela: unos valores de 1.0 en todas las métricas sobre un problema de clasificación tabular con seis features sugieren un dataset muy separable, posiblemente sintético o generado por reglas deterministas, más que un fenómeno real complejo.

## Capacidades

- Clasificación binaria tabular: estima la probabilidad de estado de pánico/sobrecarga a partir de seis features numéricas.
- Inferencia en navegador: compatible con `onnxruntime-web` (WebAssembly), lo que permite ejecutar el modelo en el cliente sin backend.
- Inferencia en Python: compatible con `onnxruntime` (sesión estándar, entrada `[1, 6]` float32, salida `probabilities`).
- Contrato de entrada fijo: `seviye_kod`, `sahne_no`, `karar_suresi_sn`, `secenek_degistirme_sayisi`, `ipucu_tiklama_sayisi`, `onceki_asama_hatasi`, todos float32.
- Baja latencia: al ser un modelo lineal con seis features, la inferencia es prácticamente instantánea (orden de microsegundos a milisegundos según el runtime).
- No soporta tool calling, agentes, razonamiento multi-paso, generación de texto, visión, audio ni capacidades multilingües.

## Casos de uso

- Tutor socrático adaptativo en simuladores educativos: el modelo puede integrarse en un simulador de ingeniería del software para detectar cuándo el estudiante entra en sobrecarga cognitiva (tiempos de decisión largos, muchos cambios de opción, clics repetidos en pistas) y activar andamiaje pedagógico, como reducir la dificultad o mostrar una pista contextual.
- Telemetría de juegos serios en el navegador: gracias a su formato ONNX y a `onnxruntime-web`, puede ejecutarse íntegramente en el cliente, enviando solo la probabilidad agregada al servidor y reduciendo la exposición de datos personales del estudiante.
- Detección de fricción en interfaces interactivas: el mismo contrato de features (tiempo de decisión, cambios de opción, uso de pistas) es reutilizable en prototipos de tests de usabilidad para marcar sesiones con alta carga cognitiva.
- Componente de un sistema de recomendación pedagógica: la probabilidad de pánico puede alimentar una lógica de decisión que ajuste el ritmo o el nivel del contenido mostrado al usuario.
- Ejemplo docente de despliegue MLOps ligero: sirve como caso práctico para enseñar exportación de pipelines de scikit-learn a ONNX, validación de paridad numérica y publicación de un modelo en HuggingFace.
- Filtro previo en pipelines de analítica de aprendizaje: puede usarse como señal barata para priorizar qué sesiones revisar manualmente por un tutor humano, dado su coste computacional casi nulo.

## Benchmarks y rendimiento

Los únicos datos publicados por el autor son las métricas sobre el 30 % de test independiente, sin comparación con otros modelos:

| Metrica | Valor declarado |
|---|---|
| accuracy | 1.0 |
| roc_auc | 1.0 |
| f1_score | 1.0 |
| precision | 1.0 |
| recall | 1.0 |

No se han publicado resultados de benchmarks en la información disponible más allá de estas métricas internas, ni comparaciones con alternativas.

## Requisitos de hardware

- VRAM estimada: despreciable (modelo lineal con seis features; el archivo ONNX ocupa kilobyte).
- GPU recomendadas: no requiere GPU; funciona en CPU sin problema.
- Cabe en cualquier GPU consumer e incluso en dispositivos móviles y navegadores.
- Opciones de despliegue: `onnxruntime` (Python), `onnxruntime-web` (navegador/WebAssembly), y potencialmente `sklearn` si se recupera el pipeline original en joblib (el repo declara el tag `joblib`).
- Latencia y throughput: no publicados; por la naturaleza del modelo se espera latencia sub-milisegundo en CPU y throughput muy alto, pero son estimaciones no verificadas.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (clasificadores tabulares ONNX para detección de sobrecarga cognitiva en simuladores educativos).

## Limitaciones y advertencias

- El autor declara explícitamente que el modelo no puede realizar diagnóstico clínico ni médico de ansiedad o pánico; es solo un componente pedagógico de apoyo basado en telemetría de un simulador interactivo.
- Métricas perfectas (1.0 en todas las métricas) sobre el conjunto de test: alta sospecha de dataset sintético, reglas deterministas o fuga de información. No debe asumirse que generalice a poblaciones o contextos reales.
- Sin licencia declarada: no se puede asumir permiso para uso comercial ni redistribución; es necesario contactar con el autor.
- Sin información sobre el dataset de entrenamiento, sesgos, tamaño muestral ni proceso de validación.
- Contrato de entrada rígido de seis features: no admite texto, imágenes ni entradas variables; cualquier cambio en el esquema de telemetría invalida el modelo.
- Sin idiomas soportados (no procesa lenguaje natural).
- Repositorio sin descargas ni likes y con tamaño 0.0 GB: no hay evidencia de uso en producción ni de mantenimiento.
- Riesgo de alucinación no aplica en el sentido habitual (no genera texto), pero sí existe riesgo de falsos positivos/negativos al interpretar la probabilidad como señal de estado cognitivo real.

## Enlaces

- HuggingFace: https://huggingface.co/Fatih162/se-primer-panic-onnx
- No se han encontrado en la información disponible papers, blogs, repositorios ni demos adicionales.
