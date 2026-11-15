# Kwokou/BeeNara-Big

## Resumen

BeeNara Big v0.5 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-2B-Base, desarrollado por Kwokou, especializado en clasificación de documentos dentro de un árbol de carpetas completo. A diferencia de un clasificador convencional, el modelo recibe el documento (texto y, opcionalmente, la imagen de la página) junto con la jerarquía entera de carpetas del usuario, de 3 a varios cientos, y devuelve una probabilidad calibrada para cada carpeta y para la opción "ninguna encaja". Resuelve el problema del archivado automático de documentos personales y empresariales con control de riesgo explícito.

La propuesta técnica se apoya en tres pilares: una pasada única sobre el árbol completo de carpetas codificado como rutas de texto, la incorporación de la imagen de página en la mitad de las tareas de entrenamiento, y una calibración que permite umbrales de riesgo para decidir cuándo ordenar de forma autónoma y cuándo pedir confirmación al usuario. El modelo se distribuye como adaptador de 164 MB que requiere el base de 4,6 GB.

Es relevante ahora porque introduce la abstención calibrada como ciudadano de primera clase en clasificación documental: en árboles de 3 a 49 carpetas ordena solo con una tasa de error en torno al 1 %, y en árboles mayores sugiere en lugar de decidir. Frente a v0.4 mejora la exactitud global del 83,6 % al 87,4 % en las mismas 2.400 tareas de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (Qwen3.5-2B-Base) |
| Parametros totales | 2B en el modelo base; adaptador LoRA de 164 MB |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en tokens; en pruebas, un árbol de 644 carpetas cupo en contexto y uno de ~750 no |
| Tipos de cuantizacion | No disponible; el base carga en bf16 en GPU y fp32 en CPU |
| Idiomas soportados | Aleman (de), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Adaptador PEFT/LoRA (safetensors) + modelo base Qwen3.5-2B-Base |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (paper arXiv:2106.09685) sobre Qwen3.5-2B-Base. La entrada combina el texto del documento, opcionalmente la imagen de la página, y el árbol completo de carpetas serializado como rutas tipo `Finanzen/Steuer/2025`; una sola pasada forward produce la distribución de probabilidad sobre todas las carpetas más la clase "ninguna encaja". El pipeline declarado es zero-shot-classification. La calibración se apoya en técnicas de calibración de probabilidades (referencia arXiv:1706.04599) y el control de riesgo en abstención selectiva (referencia arXiv:2110.01052); el tag arXiv:1910.09700 corresponde a la familia de métricas de calibración.

El entrenamiento se realizó sobre documentos sintéticos o reescritos por modelos profesor: en v0.5 se añadió Gemma 4 para reescribir los datos de propietario de los documentos existentes, que provienen de v0.4. Cada área del árbol (persona, familia, empresa, asociación) recibe una identidad y los documentos la nombran, de modo que el modelo aprende a distinguir áreas con subcarpetas homónimas (por ejemplo, dos `Steuer/2025`). Se entrenó dos veces con semillas distintas y se publica la semilla 1, elegida sobre un conjunto de selección separado del benchmark. El coste declarado es de 14.000 kg CO2eq como cota superior del ciclo v0.5 completo, con 1x RTX A6000 (48 GB) para este modelo y 2x RTX A6000 para el proyecto, en Alemania.

## Capacidades

- Clasificación zero-shot de documentos en árboles de carpetas de 3 a varios cientos de entradas, con rutas jerárquicas como etiquetas.
- Abstención calibrada: devuelve la probabilidad de "ninguna carpeta encaja" con una recall del 85,8 % en las tareas de benchmark.
- Decisión autónoma con umbrales de riesgo para árboles de 3–9, 10–24 y 25–49 carpetas (ordena el 72 %, 57 % y 49 % de las tareas con errores del 0,3 %, 0,9 % y 1,0 % respectivamente).
- Sugerencia con confirmación del usuario en árboles de 50 carpetas en adelante.
- Lectura multimodal: usa la imagen de la página (membrete, logotipo, maquetación) junto al texto en la mitad de las tareas de entrenamiento; también funciona solo con texto.
- Desambiguación por área: distingue áreas con subcarpetas de nombre idéntico si los nodos superiores llevan el nombre del propietario.
- Petición explícita de intervención cuando el texto no basta: reparte la probabilidad entre dos carpetas igual de plausibles (confianza mediana de 0,50 en esas tareas).
- Estabilidad ante reordenación: barajar la lista de carpetas cambia la decisión en el 2,3 % de las tareas.
- Soporte de nombres de carpeta libres, con descripción opcional tras un guion.
- Cambio de idioma interno del prompt entre aleman e ingles mediante el parámetro `language`.

## Casos de uso

- Archivado automático de documentos fiscales personales: el modelo recibe el texto del justificante o de la declaración y el árbol `Finanzen/Steuer/2024`, `Finanzen/Steuer/2025`, etc., y asigna la carpeta con umbral de riesgo; en árboles de hasta 49 carpetas puede mover el fichero sin intervención con una tasa de error en torno al 1 %.
- Gestión documental de despachos y asesorías: con árboles de 50 a 199 carpetas, donde alcanza el 90 % de exactitud, el modelo propone la carpeta y el gestor confirma, reduciendo el tiempo de clasificación manual en lotes grandes.
- Separación de documentación de hogar y empresa: si el árbol nombra las áreas (`Familie Berger/...` y `Berger GmbH/...`), el modelo distingue a qué área pertenece un documento aunque las subcarpetas sean homónimas, evitando el error típico de archivar una factura de empresa en el área personal.
- Digitalización con OCR y visión: en flujos donde el texto extraído es pobre o ambiguo (escaneos, facturas con membrete), se pasa también la imagen de la página mediante `images=[...]` para aprovechar logotipos y maquetación como señal adicional.
- Enrutado en sistemas de gestión documental (DMS): integrado como paso previo a la indexación, el modelo clasifica cada documento entrante contra el árbol de carpetas del repositorio y deja en cola de revisión humana solo los casos con baja confianza o con "ninguna encaja" alto.
- Detección de documentación huérfana: la clase "ninguna encaja" (recall del 85,8 %) permite detectar documentos que no corresponden a ninguna carpeta existente y proponer la creación de una nueva categoría en lugar de forzar una asignación incorrecta.
- Despliegue en CPU para clasificación ligera: el hermano pequeño BeeNara decide entre hasta 9 carpetas en CPU; BeeNara Big, con base de 2B, cubre árboles mayores en GPU o CPU en fp32 cuando el volumen no exige latencia baja.
- Clasificación multilingüe de correspondencia: soporta aleman e ingles, útil en entornos empresariales centroeuropeos con documentación en ambos idiomas.

## Benchmarks y rendimiento

Evaluación sobre un "mundo" retenido: árboles, nombres de carpeta y documentos no vistos en entrenamiento. 2.400 tareas, 400 por tamaño de lista, incluyendo tareas sin carpeta válida, con solo una carpeta vecina similar y con la carpeta padre como respuesta correcta. Inferencia calibrada en PyTorch bf16.

| Metrica | BeeNara Big v0.5 | BeeNara Big v0.4 |
|---|---|---|
| Exactitud global (2.400 tareas) | 87,4 % | 83,6 % |
| Exactitud en árboles de 3–199 carpetas | 89–95 % | No disponible |
| Exactitud en árboles de 50–199 carpetas | 90 % | 84 % |
| Exactitud en árboles de 200+ carpetas | 66 % | No disponible |
| Recall de "ninguna encaja" | 85,8 % | 75,7 % |
| Error de calibración esperado (ECE) | 0,019 | No disponible |
| Cambio de decisión al barajar carpetas | 2,3 % | No disponible |
| Tareas ordenadas automáticamente (3–9 / 10–24 / 25–49 carpetas) | 72 % / 57 % / 49 % | Solo 3–9 carpetas |
| Tasa de error en ordenación automática (3–9 / 10–24 / 25–49) | 0,3 % / 0,9 % / 1,0 % | No disponible |
| Confianza mediana en tareas ambiguas | 0,50 | 0,72 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo base Qwen3.5-2B ocupa 4,6 GB en bf16 y el adaptador 164 MB; en fp32 sobre CPU el consumo de memoria es aproximadamente el doble.
- GPU recomendadas: el autor entrenó con 1x NVIDIA RTX A6000 (48 GB); para inferencia basta una GPU con al menos 6–8 GB de VRAM en bf16.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 4090) en bf16.
- CPU: funciona en fp32; el hermano pequeño BeeNara está pensado para CPU con hasta 9 carpetas, mientras que BeeNara Big con árboles grandes en CPU será notablemente más lento.
- Opciones de despliegue: el autor proporciona el script `beenara_big.py` con la clase `BeeNaraBig` (requiere torch, transformers>=5.17, peft, safetensors, tokenizers, huggingface_hub y pillow). No se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Notas |
|---|---|---|---|---|---|
| BeeNara Big v0.5 | 2B base + LoRA 164 MB | Árbol de hasta ~644 carpetas | Clasificación documental con abstención | Apache 2.0 | Ordena solo hasta 49 carpetas; sugiere en árboles mayores |
| BeeNara (hermano pequeño) | No disponible | Hasta 9 carpetas | Clasificación documental en CPU | No disponible | Decide entre como máximo 9 carpetas en CPU |
| Qwen3.5-2B-Base | 2B | No disponible | Modelo base generalista | No disponible | No incluye calibración ni abstención específica para árboles de carpetas |

No se dispone de datos de benchmarks de terceros para establecer una comparación cuantitativa con otros clasificadores documentales zero-shot.

## Limitaciones y advertencias

- Solo soporta aleman e ingles; documentos en otros idiomas no están cubiertos por el entrenamiento declarado.
- En árboles de 200 carpetas o más la exactitud cae al 66 % y la calibración no encuentra umbral de riesgo, por lo que el modelo solo sugiere y requiere confirmación humana.
- El límite práctico de contexto se sitúa entre 644 y 750 carpetas; por encima, el árbol no cabe en una pasada.
- La desambiguación entre áreas depende de que los nodos superiores lleven el nombre del propietario; si el árbol no nombra sus áreas, el modelo reparte la probabilidad y pide intervención.
- Riesgo de alucinación de carpeta: aunque la calibración mitiga el problema, en árboles grandes puede asignar una carpeta plausible pero incorrecta; los umbrales de error del 0,3–1,0 % aplican solo a los rangos de 3–49 carpetas.
- Los documentos de entrenamiento son reescritos por modelos profesor, lo que puede introducir un sesgo de estilo respecto a documentos reales de usuarios.
- El rendimiento se ha medido en un "mundo" retenido sintético; no hay validación publicada sobre corpus documentales reales.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen3.5-2B-Base, no detallada en la información disponible.
- El adaptador requiere instalar y cargar el modelo base completo; no es un artefacto autónomo.
- No se documentan medidas específicas de mitigación de sesgos demográficos o culturales en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kwokou/BeeNara-Big
- Modelo hermano BeeNara: https://huggingface.co/Kwokou/BeeNara
- Modelo base Qwen3.5-2B-Base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Paper LoRA: https://arxiv.org/abs/2106.09685
- Paper de calibración de redes neuronales: https://arxiv.org/abs/1706.04599
- Paper de abstención selectiva: https://arxiv.org/abs/2110.01052
- Paper de métricas de calibración: https://arxiv.org/abs/1910.09700
