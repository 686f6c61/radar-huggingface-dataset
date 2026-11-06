# huseyinbaran/overload-uyum

## Resumen

Overload uyum modeli v2.0 es un clasificador tabular binario muy ligero publicado por el desarrollador huseyinbaran en Hugging Face. No es un modelo de lenguaje: es un pipeline de scikit-learn (`StandardScaler` + `LogisticRegression`) exportado a ONNX (opset 17) que ocupa 573 bytes y predice la probabilidad de que un jugador elija la opción atractiva pero incorrecta en una ventana de decisión del videojuego educativo Overload, ambientado en una crisis de sistemas de información hospitalaria.

El modelo resuelve un problema de adaptación dinámica de dificultad: la probabilidad estimada (p) se compara con un umbral de 0,5 para decidir si el juego activa el tutor socrático y desactiva el temporizador (p ≥ 0,5) o mantiene el flujo normal (p < 0,5). El modelo no conoce la respuesta correcta ni la revela; solo estima la necesidad de apoyo del jugador en ese instante.

Su relevancia es fundamentalmente educativa y de ingeniería de ML: demuestra un flujo completo de definición de especificación, umbrales de aceptación previos al entrenamiento, exportación a ONNX con verificación de paridad numérica y despliegue en navegador mediante onnxruntime-web. No debe confundirse con un modelo generativo ni con un sistema de evaluación de estudiantes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Regresión logística binaria con estandarización previa (`StandardScaler → LogisticRegression`, scikit-learn 1.9.1, Python 3.12, `random_state=13`) |
| Parámetros totales | 7 coeficientes + 7 medias + 7 desviaciones típicas + intercepto (modelo ONNX de 573 bytes) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; entrada de vector fijo de 7 características por muestra |
| Tipos de cuantización | No disponible (el modelo ya es float32 y de tamaño despreciable; no se documentan cuantizaciones) |
| Idiomas soportados | No disponible (no procesa texto; los nombres de características están en turco) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17); entrada `input` float32 `[n, 7]`, salida `probabilities` `[n, 2]` (clase 1 = mala elección) |

Orden de características (contrato definido en `config.json` → `features`): `seviye, karar_no, ort_karar_sn, onceki_kotu, uyumsuz_ajan, overload, tutor_soru`.

Coeficientes sobre características estandarizadas:

| Característica | Coeficiente | Interpretación |
|---|---|---|
| `uyumsuz_ajan` | +0,89 | Enviar un agente inadecuado es la señal de alerta más fuerte |
| `onceki_kotu` | +0,83 | Quien falló antes puede volver a fallar |
| `ort_karar_sn` | +0,57 | Tiempo de decisión alto indica duda |
| `overload` | +0,46 | Bajo presión aumenta el error |
| `tutor_soru` | −0,24 | Consultar al tutor reduce el fallo |
| `seviye` | −0,29 | Experiencia |
| `karar_no` | −0,43 | A igualdad del resto, el jugador se calienta conforme avanza el turno |

## Arquitectura y entrenamiento

El modelo es un clasificador lineal sobre siete características tabulares, precedido de un escalado estándar. No hay red neuronal, atención ni capas ocultas: la frontera de decisión es un hiperplano en el espacio de características estandarizado. La exportación a ONNX (opset 17) mantiene una diferencia máxima frente a scikit-learn de 1,2e-7, por debajo del umbral de 1e-4 fijado en la especificación.

Los datos de entrenamiento son completamente sintéticos: `data/oturmas.csv` contiene 400 sesiones y 2183 decisiones, con una tasa de mala elección del 33 %. Las reglas generadoras y la semilla están documentadas en `data/SOZLUK.md` y `data/uret.py`. No hay datos de jugadores reales ni se documenta RLHF, DPO ni ningún proceso de ajuste por preferencias. La métrica de evaluación se calcula sobre un 25 % reservado y estratificado.

## Capacidades

- Clasificación tabular binaria: estima la probabilidad de que el jugador seleccione la opción atractiva pero incorrecta en una ventana de decisión.
- Inferencia en navegador mediante onnxruntime-web y en Python mediante onnxruntime, con el mismo grafo.
- Salida de dos clases (`probabilities` `[n, 2]`), donde la clase 1 corresponde a mala elección.
- Procesamiento por lotes: la entrada admite `[n, 7]`, por lo que puede puntuar varias decisiones simultáneamente.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto.
- No tiene capacidades multilingües: no procesa lenguaje natural.

## Casos de uso

- Ajuste dinámico de dificultad en el juego Overload: el motor del juego consulta la probabilidad en cada ventana de decisión y activa el tutor socrático cuando p ≥ 0,5, desactivando el temporizador en modo experimentado.
- Despliegue íntegro en cliente web: al pesar 573 bytes y ejecutarse con onnxruntime-web, el modelo puede servirse junto al juego sin backend de inferencia ni coste de latencia de red.
- Prototipado de sistemas de tutoría adaptativa: sirve como referencia de cómo definir un umbral de intervención pedagógica a partir de una probabilidad calibrada y una especificación previa.
- Docencia de ingeniería de ML: ejemplo completo de contrato de características, umbrales de aceptación fijados antes del entrenamiento y verificación de paridad entre framework y formato de exportación.
- Telemetría de sesión en investigación educativa: permite registrar la evolución de p a lo largo de una partida para estudiar la relación entre duda, presión y errores, siempre con datos reales validados antes de extraer conclusiones.
- Pruebas de integración de pipelines ONNX: por su tamaño mínimo y su contrato de entrada fijo, es útil como caso de prueba en CI para validar versiones de onnxruntime y de onnxruntime-web.
- Simulación de comportamiento de jugadores en el diseño del propio juego: el equipo puede usar el modelo para generar perfiles sintéticos de apoyo y equilibrar la curva de dificultad antes de probar con personas.

## Benchmarks y rendimiento

| Métrica | Valor | Umbral de aceptación (spec.md §12.3, fijado antes del entrenamiento) |
|---|---|---|
| ROC-AUC (25 % test estratificado) | 0,892 | ≥ 0,75 (cumple) |
| Exactitud (umbral 0,5) | 0,832 | ≥ 0,70 (cumple) |
| Diferencia máxima ONNX ↔ sklearn | 1,2e-7 | ≤ 1e-4 (cumple) |

No se han publicado comparaciones con otros modelos en la información disponible. El propio autor advierte que el AUC es optimista porque los datos se generaron con una regla logística que la regresión logística recupera con facilidad.

## Requisitos de hardware

- VRAM estimada: despreciable; el modelo ONNX ocupa 573 bytes en float32 y cabe en cualquier memoria disponible.
- GPU recomendadas: no requiere GPU; la inferencia es viable en CPU, en navegador y en dispositivos móviles.
- Cabe en cualquier GPU de consumo y en hardware integrado; también en entornos sin acelerador.
- Opciones de despliegue: onnxruntime (Python), onnxruntime-web (navegador), y cualquier runtime compatible con ONNX opset 17.
- Latencia y throughput: no se documentan cifras; por el tamaño del grafo y la dimensionalidad de entrada (7 características), la inferencia es de microsegundos en CPU para lotes pequeños.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (clasificadores tabulares ligeros para adaptación de dificultad en juegos educativos). Como referencia de categoría, cualquier regresión logística exportada a ONNX con siete características sería funcionalmente equivalente; el valor diferencial de este modelo está en la especificación, los umbrales de aceptación y la verificación de paridad, no en la arquitectura.

## Limitaciones y advertencias

- El AUC de 0,892 es optimista: los datos son sintéticos y generados por una regla logística, que la regresión logística recupera casi por construcción. Con jugadores reales se espera una caída notable del rendimiento.
- La puntuación oculta de "habilidad" del jugador es una suposición del generador de datos; los jugadores reales pueden no ajustarse a ella (por ejemplo, jugadores rápidos pero descuidados).
- El modelo solo observa el comportamiento dentro de un turno; no conoce partidas anteriores del jugador.
- Los eventos aleatorios y las llamadas principales no se separan: ambos cuentan como "decisión".
- No debe usarse para calificar, ordenar ni evaluar a estudiantes; es un ajuste de apoyo al aprendizaje, no una medida de éxito.
- No debe usarse para tomar decisiones sobre un hospital real ni sobre un incidente real de sistemas de información.
- No debe usarse para afirmar "los estudiantes se comportan así" sin validación con datos reales de jugadores.
- Licencia MIT: permite uso comercial y modificación con atribución; no se documentan restricciones adicionales.
- No procesa texto ni otros idiomas; la entrada es exclusivamente un vector numérico de siete posiciones en un orden fijo que debe respetarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huseyinbaran/overload-uyum
- Código fuente, entrenamiento y tests: https://github.com/huseyinbaranisik/OverLoad
