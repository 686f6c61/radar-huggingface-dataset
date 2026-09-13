# rafaelmrm/mobilevit-contrastive

## Resumen

`rafaelmrm/mobilevit-contrastive` es un prototipo de investigación publicado en HuggingFace por el usuario rafaelmrm que implementa una arquitectura **MobileViT** orientada a aprendizaje contrastivo. El propio autor lo describe explícitamente como un punto de partida experimental: el checkpoint `model.safetensors` es una **inicialización válida para pruebas de humo (smoke tests)**, no un modelo entrenado ni evaluado. La model card no reclama ninguna puntuación de benchmark, lo que sitúa el repositorio en la fase de andamiaje de código más que de artefacto listo para producción.

El repositorio incluye `run.py` (implementación y punto de entrada ejecutable), `config.json` (configuración de arquitectura generada), `training_args.json` (receta de experimento por defecto) y el checkpoint en formato `safetensors`. No se especifica volumen de datos de entrenamiento, composición del dataset ni proceso de alineación (RLHF/DPO); de hecho, el autor indica que no se ha completado ningún entrenamiento.

Su relevancia actual es limitada pero acotada: sirve como base reproducible para quien quiera experimentar con variantes de MobileViT en tareas contrastivas (por ejemplo, retrieval visual o alineación imagen-texto), siempre que aporte sus propios datos y ejecute el entrenamiento. Al estar bajo licencia Apache 2.0 y con implementación propia, es reutilizable, pero requiere un adaptador explícito para cargarse con APIs genéricas de HuggingFace.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileViT (híbrido convolucional + transformer de visión) |
| Parámetros totales | 16.576 (según metadatos de `safetensors`) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje); no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (checkpoint de inicialización, no entrenado) |

Detalles de arquitectura declarados por el autor:

| Elemento | Valor |
|---|---|
| Escala | xlarge |
| Atención | dilatada (dilated) |
| Fusión | tensor fusion |
| Activación | approx gelu |
| Normalización | batchnorm |

## Arquitectura y entrenamiento

La arquitectura es MobileViT, un diseño híbrido que combina convoluciones con mecanismos de auto-atención para visión. En esta implementación concreta el autor configura atención **dilatada**, fusión de tensores (tensor fusion), activación **approx gelu** y normalización por **batchnorm**, en una escala etiquetada como **xlarge**. El modelo está orientado a objetivos **contrastivos**, es decir, a aprender representaciones donde muestras similares quedan próximas en el espacio latente, un régimen habitual en retrieval, clasificación con pocas etiquetas o alineación entre modalidades.

En cuanto al entrenamiento, no hay información verificable. La receta por defecto incluida en `training_args.json` usa el optimizador **RMSprop** con un scheduler **cosine**, pero el propio autor aclara que son valores de arranque del script y **no evidencia de una ejecución completada**. No se documenta número de tokens, composición del dataset, fases de RLHF/DPO ni ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.). La model card recomienda, para una evaluación significativa, entrenar todos los baselines con la misma exposición de datos, presupuesto de ajuste y semillas aleatorias.

## Capacidades

- Generación de representaciones visuales: al ser un modelo de visión con objetivo contrastivo, su salida esperada son embeddings, no texto.
- Tareas contrastivas: búsqueda por similitud, retrieval de imagen, clasificación con etiquetas limitadas y aprendizaje auto-supervisado (siempre tras entrenamiento).
- No hay evidencia de soporte de tool calling ni de function calling.
- No hay evidencia de capacidades de agente ni de razonamiento multi-paso.
- Capacidades multilingües: no aplica / no disponible (no es un modelo de lenguaje).
- Capacidades especiales (modo thinking, visión, audio): visión como dominio previsto; sin confirmación de que el checkpoint actual las ejecute, al no estar entrenado.
- Carga mediante APIs genéricas: requiere un adaptador explícito por tratarse de una implementación personalizada.

## Casos de uso

- **Investigación en aprendizaje contrastivo:** usar `run.py` y `training_args.json` como punto de partida reproducible para experimentar con funciones de pérdida contrastivas sobre MobileViT, comparando después con baselines de capacidad equivalente.
- **Prototipado de retrieval visual:** una vez entrenado con un dataset propio, el modelo puede generar embeddings para búsqueda de imágenes similares en catálogos (inventario, moda, producto), con el matiz de que hoy no existe checkpoint entrenado.
- **Clasificación con pocas etiquetas:** el paradigma contrastivo es útil cuando hay muchas clases y pocas muestras por clase; el modelo serviría como extractor de características previo a un clasificador ligero.
- **Validación de pipelines de entrenamiento (smoke test):** el checkpoint de inicialización permite verificar que el código carga, que las formas de tensor son correctas y que el bucle de entrenamiento arranca, antes de invertir en cómputo real.
- **Investigación en eficiencia para edge:** MobileViT está diseñado para entornos con restricciones de cómputo; el repositorio puede servir para medir coste de inferencia de variantes híbridas en dispositivos móviles.
- **Reproducibilidad y estudio de configuración:** `config.json` documenta la configuración generada, lo que permite auditar cómo cambian los resultados al variar atención dilatada, fusión o normalización.
- **Base para alineación multimodal:** el autor sugiere revisar por separado los términos de los datos de origen si se combinan con datasets externos, escenario típico en alineación imagen-texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara explícitamente que "no benchmark score is claimed in this repository" y que el checkpoint no ha sido entrenado. Cualquier cifra de MMLU, HumanEval, GSM8K o similar no aplica a este repositorio.

Orientación de evaluación aportada por el autor: usar un conjunto de test específico de la tarea, reportar la métrica principal sobre al menos tres semillas y comparar contra un baseline de capacidad equivalente, conservando los logs de entrenamiento y las versiones del entorno.

## Requisitos de hardware

- VRAM para inferencia: no disponible como dato medido. Con el recuento declarado de 16.576 parámetros, el checkpoint en sí ocupa una fracción despreciable de memoria; para una configuración MobileViT de escala xlarge plenamente entrenada, la VRAM dependería del tamaño real de pesos y de la resolución de entrada, dato no especificado.
- GPU recomendadas: no disponible. No hay indicación del autor sobre A100, H100 o RTX 4090.
- Encaje en GPU de consumo: previsiblemente sí para el checkpoint actual, dado su tamaño reportado; sin confirmación mediante medición.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje, no aplicables directamente a un modelo de visión). La vía indicada por el autor es ejecutar `run.py`, cuya sección `__main__` contiene el ejemplo de smoke test.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La información proporcionada no incluye comparaciones oficiales. Se ofrece una comparación estructural de referencia, sin cifras de rendimiento, ya que no hay benchmarks publicados para este repositorio:

| Modelo | Categoria | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rafaelmrm/mobilevit-contrastive | MobileViT para contraste | 16.576 (según safetensors) | no aplica (visión) | apache-2.0 | HuggingFace, checkpoint sin entrenar |
| MobileViT original (Apple) | MobileViT para clasificación de imagen | no disponible en esta ficha | no aplica (visión) | no disponible en esta ficha | publicación académica y pesos públicos |
| MobileNetV3 | CNN eficiente para visión | no disponible en esta ficha | no aplica (visión) | no disponible en esta ficha | ampliamente distribuido |
| EfficientNet | CNN escalada por compound scaling | no disponible en esta ficha | no aplica (visión) | no disponible en esta ficha | ampliamente distribuido |

Cualquier afirmación de superioridad o equivalencia de rendimiento carece de respaldo en la documentación disponible.

## Limitaciones y advertencias

- **El checkpoint no está entrenado.** Es una inicialización para pruebas de humo; no debe usarse para inferencia real ni para evaluar calidad.
- **Sin auditoría de sesgos.** El autor indica que el checkpoint no ha sido auditado en robustez, equidad (fairness) ni transferencia de dominio.
- **Riesgo de alucinación:** no aplica en el sentido de modelos generativos de texto, pero sí existe el riesgo de interpretar sus embeddings como significativos cuando no lo son, dado que no hay entrenamiento.
- **Idioma y contexto:** al ser un modelo de visión, las limitaciones de idioma y de ventana de contexto no aplican del mismo modo; no hay información sobre resolución de entrada ni tamaño de imagen soportado.
- **Licencia Apache 2.0:** permite uso comercial y modificación, pero el autor advierte de que los términos de los datos de origen deben revisarse por separado si el repositorio se usa con datasets externos.
- **Carga no estándar:** al ser una implementación personalizada, las APIs genéricas de carga automática requieren un adaptador explícito.
- **Riesgo de confusión entre configuración y resultado:** los valores de `training_args.json` (RMSprop, scheduler cosine) son valores por defecto del script, no evidencia de un entrenamiento completado. No deben citarse como resultados.
- **Discrepancia a vigilar:** el recuento de 16.576 parámetros es muy bajo para una configuración etiquetada como "xlarge"; conviene verificar `config.json` antes de sacar conclusiones sobre capacidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rafaelmrm/mobilevit-contrastive
- Referencia de la arquitectura base MobileViT (Apple): https://arxiv.org/abs/2110.02178
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos correspondían a páginas de un servicio de streaming y no guardan relación con este repositorio.
