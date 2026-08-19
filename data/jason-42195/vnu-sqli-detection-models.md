# Jason-42195/VNU-SQLi-Detection-Models

## Resumen

El repositorio `Jason-42195/VNU-SQLi-Detection-Models` contiene los artefactos entrenados de un sistema de detección de inyección SQL (SQLi) basado en tres ramas independientes, diseñado para desplegarse en la capa de proxy de base de datos. A diferencia de un modelo de lenguaje generativo, este proyecto es un conjunto de clasificadores y detectores de anomalías especializados en seguridad, desarrollado por el usuario Jason-42195. Su relevancia radica en un enfoque híbrido que combina clasificación supervisada, detección de anomalías no supervisada y modelado secuencial de sesiones para cubrir tanto ataques conocidos como variantes de día cero.

La rama 1 (producción) utiliza TF-IDF a nivel de caracteres con regresión logística para clasificar consultas en cinco clases, alcanzando un F1-macro de 0.9822. La rama 2 emplea una SVM de una clase entrenada únicamente con tráfico benigno para generalizar a sintaxis no vista. La rama 3, considerada la principal contribución, es una red GRU que clasifica secuencias de peticiones a nivel de sesión. El repositorio incluye comparativas de arquitecturas, ablaciones leave-one-class-out y variantes específicas para evaluación de día cero, todo ello con un pipeline declarado de `text-classification` y licencia desconocida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema multi-rama: TF-IDF (char_wb, 2-4 gram, 50k features) + Regresión Logística (Rama 1); One-Class SVM con 4 features estructurales (Rama 2); GRU (input_dim=7, hidden_dim=32, max_len=64) para sesiones (Rama 3) |
| Parametros totales | No disponible (varía por rama; la CNN comparativa tiene 28.5K parámetros, DistilBERT ~66M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje; la GRU de sesión procesa hasta 64 peticiones por sesión) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles (el dominio es consultas SQL, no lenguaje natural) |
| Licencia | unknown (datos de entrenamiento con licencia mixta/no clara) |
| Formato de pesos | joblib (vectorizer y modelos scikit-learn), safetensors (candidato DistilBERT), .pt (CNN y GRU) |

## Arquitectura y entrenamiento

El sistema se compone de tres ramas complementarias. La rama 1 es un clasificador supervisado de 5 clases (`normal`, `union_based`, `error_based`, `boolean_blind`, `time_blind`) que usa TF-IDF sobre caracteres (2-4 gram, 50k características) con regresión logística. Se entrenó sobre un conjunto de datos de 13,560 filas de test, y se comparó con alternativas como LightGBM, DistilBERT y una TextCNN con tokenizador SQL a nivel de carácter. La rama 2 es una SVM de una clase entrenada exclusivamente con tráfico benigno, utilizando cuatro características estructurales (`length`, `special_char_ratio`, `sql_keyword_count`, `entropy`), lo que permite detectar sintaxis de ataque no vista durante el entrenamiento. La rama 3 es una GRU que modela la secuencia de peticiones dentro de una sesión, clasificando la sesión completa en 4 clases (`benign`, `boolean_blind`, `time_blind`, `query_splitting`). Los datos de entrenamiento provienen del dataset `Jason-42195/VNU-SQLi-Detection`. No se menciona el uso de RLHF ni DPO, al tratarse de modelos discriminativos clásicos.

## Capacidades

- Clasificación multiclase de consultas SQL en 5 categorías (normal, union-based, error-based, boolean-blind, time-blind) con F1-macro de 0.9822.
- Detección de anomalías sobre tráfico benigno mediante One-Class SVM, con precisión promedio de 0.982, capaz de generalizar a sintaxis de ataque no vista.
- Clasificación a nivel de sesión mediante GRU, identificando patrones de ataque que requieren contexto de múltiples peticiones (boolean-blind, time-blind, query splitting).
- Evaluación de cobertura de día cero mediante ablaciones leave-one-class-out, que permiten medir si el sistema combinado detecta familias de ataque no incluidas en el entrenamiento supervisado.
- Inferencia de baja latencia para la rama de producción (p50 de 0.8 ms), adecuada para filtrado en tiempo real.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al no ser un modelo generativo.

## Casos de uso

- Filtrado en tiempo real en proxy de base de datos: la rama 1 puede clasificar cada consulta entrante con una latencia p50 de 0.8 ms y un tamaño de 3.5 MB, integrándose en el flujo de peticiones sin impacto perceptible en el rendimiento.
- Detección de ataques de día cero: la rama 2, entrenada solo con tráfico benigno, puede marcar como anómalas consultas que no se ajustan a la estructura esperada, cubriendo variantes de SQLi no presentes en el dataset de entrenamiento.
- Monitorización de sesiones de usuario: la rama 3 analiza secuencias de hasta 64 peticiones por sesión para detectar ataques de tipo boolean-blind o time-blind que se distribuyen en múltiples consultas individuales aparentemente inofensivas.
- Integración en sistemas WAF (Web Application Firewall): los artefactos pueden servir como capa adicional de detección, complementando reglas basadas en firmas con un enfoque estadístico y de anomalías.
- Enriquecimiento de SIEM: las puntuaciones de anomalía de la rama 2 y las clasificaciones de sesión de la rama 3 pueden exportarse como eventos estructurados para correlación con otros indicadores de compromiso.
- Pruebas de seguridad en CI/CD: el modelo puede utilizarse para validar automáticamente si un conjunto de consultas generadas durante pruebas de penetración son detectadas correctamente, ayudando a ajustar umbrales de detección.

## Benchmarks y rendimiento

Se han publicado resultados detallados para las distintas ramas y arquitecturas comparadas:

| Modelo / Rama | Métrica principal | Latencia p50 | Tamaño |
|---|---|---|---|
| Rama 1 v1 (TF-IDF + LogReg) | F1-macro 0.9822 (5 clases) | 0.8 ms | 3.5 MB |
| Candidato TF-IDF + LightGBM | F1-macro 0.9912 | 91.7 ms | 5.7 MB |
| Candidato DistilBERT | F1-macro 0.9892 | 2.9 ms (GPU) | 256 MB |
| Candidato CNN (TextCNN + tokenizador SQL) | F1-macro 0.9838 | 0.3 ms | 0.11 MB (28.5K params) |
| Rama 2 v1 (One-Class SVM) | Precisión promedio 0.982 | no disponible | no disponible |
| Rama 3 v1 (GRU sesión) | Ver repositorio del proyecto | no disponible | no disponible |

Las ablaciones `branch1_no_*` (leave-one-class-out) obtienen un F1-macro de aproximadamente 0.98 sobre las clases restantes. No se proporcionan resultados de benchmarks externos comparativos con otros sistemas de detección de SQLi en la información disponible.

## Requisitos de hardware

- Rama 1 (TF-IDF + LogReg): puede ejecutarse en CPU con recursos mínimos; requiere aproximadamente 3.5 MB de RAM para el modelo y vectorizador, con latencia p50 de 0.8 ms.
- Rama 2 (One-Class SVM): también ligera y ejecutable en CPU; el tamaño no se especifica pero es comparable al de un modelo clásico de scikit-learn.
- Rama 3 (GRU): requiere PyTorch para cargar el state dict; el tamaño no se especifica, pero al ser una GRU pequeña (hidden_dim=32, max_len=64) es viable en CPU.
- Candidato DistilBERT: necesita una GPU para alcanzar latencias de 2.9 ms; en CPU la latencia sería significativamente mayor. Requiere aproximadamente 256 MB de memoria para los pesos.
- Candidato CNN: extremadamente ligero (0.11 MB, 28.5K parámetros), ejecutable en CPU con latencia de 0.3 ms.
- Opciones de despliegue: al no ser un LLM, no aplican vLLM, llama.cpp ni Ollama. Puede servirse mediante frameworks estándar de scikit-learn y PyTorch, o empaquetarse como microservicio con FastAPI o similares.

## Comparativa con modelos similares

Dentro del propio repositorio se comparan cuatro arquitecturas para la rama 1, siendo la más relevante la comparativa interna:

| Característica | TF-IDF + LogReg (producción) | TF-IDF + LightGBM | DistilBERT | TextCNN |
|---|---|---|---|---|
| F1-macro | 0.9822 | 0.9912 | 0.9892 | 0.9838 |
| Latencia p50 | 0.8 ms | 91.7 ms | 2.9 ms (GPU) | 0.3 ms |
| Tamaño | 3.5 MB | 5.7 MB | 256 MB | 0.11 MB |
| Dependencias | scikit-learn, joblib | LightGBM | transformers, safetensors | PyTorch |

No se dispone de comparativas externas con otros modelos de detección de SQLi (por ejemplo, enfoques basados en transformers como CodeBERT o sistemas comerciales) en la información proporcionada.

## Limitaciones y advertencias

- La clase `boolean_blind` de la rama 1 presenta aproximadamente un 13% de ruido de etiquetas, ya que actúa como categoría comodín para filas de ataque no emparejadas.
- El F1 uniformemente alto (0.98-0.99) en todas las arquitecturas de la rama 1 indica que el dataset actual es fácil de separar; no es un benchmark adversarial ni de ofuscación.
- No se ha realizado todavía un test de robustez frente a ataques adversariales u ofuscación de consultas.
- La licencia del modelo es `unknown` y la de los datos de entrenamiento es mixta/no clara, por lo que se recomienda tratar el uso como de investigación o evaluación interna, verificando los términos del dataset antes de un despliegue comercial.
- La rama 3 requiere el código del repositorio del proyecto para reconstruir la definición del modelo y el extractor de características de sesión; los pesos solos no son autocontenidos.
- El candidato CNN requiere un helper específico del script de entrenamiento para reconstruir la arquitectura y el tokenizador.

## Enlaces

- Modelo en HuggingFace: [Jason-42195/VNU-SQLi-Detection-Models](https://huggingface.co/Jason-42195/VNU-SQLi-Detection-Models)
- Dataset de entrenamiento: [Jason-42195/VNU-SQLi-Detection](https://huggingface.co/datasets/Jason-42195/VNU-SQLi-Detection)
- Repositorio del proyecto: no disponible en la información proporcionada (se menciona en la model card pero no se incluye la URL)
