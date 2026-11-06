# blny66/the-primer-v2

## Resumen

The Primer v2 (identificador `blny66/the-primer-v2`) no es un modelo de lenguaje, sino un clasificador binario de árbol de decisión exportado a ONNX. Su función es predecir si un estudiante de ingeniería que está jugando a la simulación de crisis "The Primer" necesita apoyo personalizado de un tutor de IA en un momento de decisión concreto. El modelo devuelve `1` cuando estima que el jugador está bloqueado y `0` cuando el ritmo editorial del juego debe continuar sin interrupciones.

El modelo lo publica el usuario `blny66` en Hugging Face y se apoya en un `DecisionTreeClassifier` de scikit-learn con profundidad máxima 3, convertido a `model.onnx` con `ZipMap=False`. La entrada es un vector fijo de 8 características `float32` en un orden estrictamente definido (tiempo de decisión, número de cambios de respuesta, fallos previos, dificultad de la escena, uso de pistas, nivel de experiencia del jugador y progreso en la historia). No procesa texto, imágenes ni audio, y no dispone de tokenizador ni de ventana de contexto.

La relevancia del modelo es acotada: se trata de un artefacto de integración para un videojuego educativo concreto, con métricas declaradas sobre un conjunto de test pequeño y con datos de entrenamiento sintéticos. No es un modelo generativo, no soporta tool calling ni razonamiento multi-paso, y su uso fuera del contexto de "The Primer" está explícitamente desaconsejado por el autor. Cualquier evaluación como "modelo de IA" en el sentido habitual debe descartarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Árbol de decisión (`DecisionTreeClassifier(max_depth=3)`) exportado a ONNX |
| Parametros totales | no disponible (el autor no publica recuento de parámetros; un árbol de profundidad 3 tiene como máximo 7 nodos de división) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica; la entrada es un vector de 8 características) |
| Tipos de cuantizacion | no disponible (no se publican variantes cuantizadas) |
| Idiomas soportados | no disponible (el modelo no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`model.onnx`, `ZipMap=False`) |

## Arquitectura y entrenamiento

La arquitectura es un árbol de decisión supervisado de profundidad máxima 3, entrenado con scikit-learn y exportado a ONNX con la opción `ZipMap=False`, lo que implica que la salida es un tensor en lugar de un mapa. La variable objetivo es `destek_gerekli` (0 = flujo normal, 1 = se requiere apoyo del tutor de IA). La entrada es un contrato de 8 características `float32` en orden fijo: `karar_suresi_sn`, `karar_degistirme_sayisi`, `onceki_basarisiz_karar_sayisi`, `ortalama_karar_suresi_sn`, `sahne_zorlugu`, `yardim_kullanim_sayisi`, `oyuncu_deneyim_seviyesi` y `sahne_ilerleme_orani`.

El conjunto de entrenamiento consta de 135 observaciones procedentes de 45 sesiones, y el de test de 45 observaciones de 15 sesiones. La partición se realizó con `GroupShuffleSplit(test_size=0.25, random_state=42)` para evitar fuga de información entre sesiones. El autor indica que los datos son sintéticos, generados por bootstrap, y que el modelo debe reentrenarse periódicamente a medida que se recojan sesiones reales de jugadores. No se documenta ningún proceso de RLHF, DPO ni ajuste fino posterior.

## Capacidades

- Clasificación binaria de necesidad de apoyo pedagógico a partir de 8 variables de comportamiento en juego.
- Predicción en tiempo casi real de "bloqueo" del estudiante durante una escena de decisión.
- Integración con el bucle de juego para activar o no la intervención del tutor de IA ("Primer bu bölümde biraz zorlandığını fark etti. Birlikte düşünelim mi?").
- No soporta generación de texto, código, matemáticas, visión ni audio.
- No dispone de tool calling ni de function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades multilingües: no procesa lenguaje.
- No dispone de modo "thinking", visión, audio ni ninguna otra capacidad generativa.

## Casos de uso

- Activación adaptativa del tutor en el juego "The Primer": el motor consulta el modelo tras cada decisión del estudiante y, si la salida es `1`, lanza la intervención del tutor de IA sin romper la narrativa.
- Ajuste de dificultad en tiempo real: si el modelo predice de forma repetida necesidad de apoyo en una misma escena, el sistema puede suavizar la dificultad o introducir pistas adicionales antes de que el jugador abandone.
- Telemetría pedagógica agregada: las predicciones pueden registrarse por sesión para que el equipo docente identifique las escenas con mayor tasa de bloqueo y rediseñe su contenido.
- Investigación sobre comportamiento en simulaciones de crisis: el vector de 8 características y la etiqueta permiten analizar correlaciones entre tiempo de decisión, cambios de respuesta y necesidad de apoyo en estudios controlados.
- Filtro previo a la intervención humana: en entornos con tutores reales, el modelo puede priorizar qué sesiones requieren atención humana inmediata frente a las que pueden seguir solas.
- Prototipado de sistemas de soporte adaptativo en otros juegos serios: el contrato de 8 características y el árbol de profundidad 3 sirven como línea base interpretable y de bajo coste computacional antes de sustituirlo por un modelo supervisado más complejo.
- Despliegue en el cliente o en el servidor: al ser un ONNX de tamaño mínimo (repo de 0,0 GB), puede ejecutarse en el propio dispositivo del jugador sin dependencia de infraestructura de inferencia.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| F1 | 0,8636 |
| Precision | 1,0000 |
| Recall | 0,7600 |
| Accuracy | 0,8667 |
| Matriz de confusion | TN=20, FP=0, FN=6, TP=19 |
| Umbral de aceptacion definido por el autor | F1 >= 0,70 |
| Verificacion numerica ONNX vs. scikit-learn | `abs(sklearn - onnx) = 8,5149e-09 < 1e-4` |

El modelo supera el umbral de aceptación predefinido (F1 >= 0,70) con un F1 de 0,8636 sobre 45 observaciones de test. La precisión de 1,0 indica que no hay falsos positivos en el conjunto de test (TN=20, FP=0), mientras que el recall de 0,76 implica 6 falsos negativos (FN=6): en esos casos el estudiante necesitaba apoyo pero el modelo no lo detectó. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente despreciable; el repositorio ocupa 0,0 GB y el grafo ONNX de un árbol de profundidad 3 contiene pocos nodos.
- GPU recomendadas: no se requiere GPU; la inferencia ONNX puede ejecutarse en CPU sin coste significativo. Cualquier GPU consumer (por ejemplo, RTX 4090) es sobradamente suficiente, pero no es necesaria.
- Cabe en cualquier GPU consumer y también en CPU, móvil o navegador mediante ONNX Runtime Web.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#, Java, JavaScript), integración con scikit-learn para reentrenamiento, y cualquier runtime compatible con ONNX. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por la naturaleza del modelo (árbol de 3 niveles), la latencia esperada es del orden de microsegundos a milisegundos en CPU, pero el autor no publica cifras.

## Comparativa con modelos similares

No se dispone de modelos comparables en la información proporcionada. El modelo pertenece a la categoría de clasificadores tabulares ligeros para sistemas de tutoría adaptativa, y el autor no incluye comparaciones con alternativas como regresores logísticos, random forests o gradient boosting. Cualquier comparación con modelos de lenguaje (por ejemplo, clasificadores basados en transformers) quedaría fuera de categoría y no está documentada.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| The Primer v2 | no disponible (árbol de profundidad 3) | no aplica | F1 0,8636 en test de 45 observaciones | no disponible | Hugging Face (`blny66/the-primer-v2`) |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El autor declara explícitamente que el modelo solo debe usarse en el contexto del juego de simulación de crisis "The Primer" y no como decisor en una crisis hospitalaria real.
- Los datos de entrenamiento son sintéticos (bootstrap); el modelo debe reentrenarse periódicamente con sesiones reales de jugadores.
- El conjunto de test es muy pequeño (45 observaciones de 15 sesiones), por lo que las métricas publicadas tienen alta variabilidad e intervalos de confianza amplios.
- Recall de 0,76: existe un 24 % de falsos negativos en test, es decir, estudiantes que necesitaban apoyo y no lo recibieron por la predicción del modelo.
- No hay información sobre sesgos demográficos, culturales o de género; el modelo solo usa variables de comportamiento anónimas y no recoge identificadores personales (nombre, IP, ubicación), según el autor.
- Riesgo de alucinación: no aplica en el sentido generativo, pero el modelo puede producir predicciones erróneas (falsos positivos o negativos) sobre el estado del estudiante.
- Limitaciones de contexto: no procesa lenguaje ni datos secuenciales; cada predicción se basa en un vector fijo de 8 características y no en el historial completo de la sesión.
- Restricciones de licencia: la licencia no está disponible, por lo que no se puede confirmar si el uso comercial está permitido.
- El modelo no puede obligar al estudiante a aceptar la ayuda: el autor subraya que la decisión final siempre debe recaer en el jugador.
- No se documentan versiones cuantizadas ni otros formatos de pesos distintos de ONNX.

## Enlaces

- Hugging Face: https://huggingface.co/blny66/the-primer-v2
- Resultado de búsqueda web no relacionado (robot PRIMER-V2 de Playto Labs, sin conexión con este modelo): https://www.facebook.com/playtolabs/videos/meet-primer-v2-the-worlds-first-bicycle-riding-robot-this-is-the-best-combinatio/440766738281922/
