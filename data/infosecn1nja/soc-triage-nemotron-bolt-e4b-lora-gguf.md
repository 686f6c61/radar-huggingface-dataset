# infosecn1nja/soc-triage-nemotron-bolt-e4b-lora-gguf

## Resumen

`soc-triage-nemotron-bolt-e4b-lora-gguf` es un adaptador LoRA en formato GGUF publicado por el usuario infosecn1nja para especializar el modelo base `nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16` en tareas de triaje de alertas de un centro de operaciones de seguridad (SOC). El paquete no es un modelo autónomo, sino un conjunto de artefactos para llama.cpp: una cuantización Q4_K_M del modelo base (5,0 GB), el adaptador LoRA F16 (3,3 MB) y una plantilla de chat que desactiva el modo de razonamiento extendido. El objetivo declarado es la clasificación de disposición en 7 clases con referencias de evidencia, no la caza de amenazas.

El modelo base es un transformer de aproximadamente 7.518 millones de parámetros totales según los pesos en safetensors del repositorio, con ventana de contexto operativa de 4096 tokens en la configuración validada. El adaptador se entrenó mediante LoRA de rango 8 sobre 4 capas durante 30 iteraciones y 420 ejemplos sintéticos, lo que sitúa su huella de entrenamiento en un régimen muy reducido.

La relevancia del proyecto reside en su honestidad metodológica: la propia model card documenta una corrección del 29 de octubre de 2026 en la que el autor reconoce que evaluaciones previas medían el modelo base en lugar del adaptador, y concluye que el adaptador no mejora al base (macro-F1 de 0,3788 y 0,7828 frente a 0,9541 del base con guardarraíles, aunque con coberturas muy distintas). Es, por tanto, más útil como ejemplo de canalización de triaje con guardarraíles y de validación de despliegue en llama.cpp que como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base NVIDIA Nemotron-3.5-Bolt-E4B); adaptador LoRA sobre 4 capas |
| Parametros totales | 7.518.069.290 (pesos del modelo base en safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | 4096 tokens en la configuración de despliegue validada (`-c 4096`) |
| Tipos de cuantizacion | Q4_K_M (base de producción, 5,0 GB); Q8_0 y BF16 probados como referencia; adaptador LoRA en F16 (3,3 MB) |
| Idiomas soportados | en (inglés) |
| Licencia | openmdw-1.1 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | GGUF (base cuantizada + adaptador LoRA GGUF); plantilla Jinja `soc-triage-nonthink.jinja` |

## Arquitectura y entrenamiento

El artefacto principal es una cuantización Q4_K_M del modelo base BF16 de NVIDIA, empaquetada para llama.cpp, más un adaptador LoRA independiente en formato GGUF que se carga con el flag `--lora`. La plantilla de chat incluida desactiva explícitamente el modo de pensamiento (thinking), de modo que la inferencia se realiza en modo no-thinking sobre una ventana de 4096 tokens. El repositorio incluye también un archivo fusionado de un solo paso (`soc-triage-bolt-e4b-Q4_K_M.gguf`, 4,9 GB) que el autor marca como DEPRECATED tras obtener solo un 66,7 % de concordancia de etiquetas.

El entrenamiento del adaptador consistió en un LoRA de rango 8 aplicado a 4 capas, durante 30 iteraciones, sobre 420 ejemplos sintéticos del dataset `infosecn1nja/soc-triage-opensec-chat`. No se documentan fases de RLHF ni DPO. El autor advierte que la precisión en el mundo real no está probada y que el adaptador debe usarse junto con los guardarraíles de TriageKit. La corrección publicada el 2026-10-29 aclara que `mlx_lm.server` solo aplica `--adapter-path` cuando el identificador de modelo de la petición es `default_model`, por lo que las evaluaciones anteriores de servidor medían el modelo base: de ahí la conclusión de que el adaptador no aporta mejora de calidad frente al base.

## Capacidades

- Generación de texto orientada a triaje de alertas de seguridad con salida JSON estructurada y validación de contrato (100 % de validez JSON y de contrato en las pruebas doradas).
- Clasificación de disposición en 7 clases, con referencias de evidencia asociadas a cada alerta.
- Modo no-thinking forzado mediante plantilla Jinja, lo que reduce latencia y evita cadenas de razonamiento largas en un dominio donde se prioriza la estabilidad del formato.
- Comportamiento conservador por diseño: en telemetría real tiende a abstenerse o clasificar como benigno, con cero falsos positivos en las pruebas de control.
- Integración con llama.cpp mediante `llama-server`, con soporte de `--lora`, `--jinja` y plantilla de chat externa.
- Capacidades multilingües: limitadas al inglés según la model card.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión ni audio en la información disponible.

## Casos de uso

- Triaje de alertas en un SOC de nivel 1: el modelo recibe la alerta y devuelve una disposición de 7 clases más referencias de evidencia, lo que permite enrutar automáticamente a humano o cerrar casos benignos con guardarraíles que bloquean cierres inseguros.
- Enrutamiento seguro con abstención: dado su comportamiento conservador y su tasa de falsos positivos nula en los controles con Wazuh (59 alertas rutinarias sin marcar, 48 alertas de ataque sin degradar), encaja como primera capa que deriva a revisión humana en lugar de auto-cerrar.
- Generación de resúmenes estructurados de alertas: la validez de contrato del 100 % en las pruebas doradas permite consumir la salida directamente en pipelines que esperan JSON con campos fijos.
- Despliegue en infraestructura modesta: con 5,0 GB de pesos Q4_K_M más 3,3 MB de adaptador, puede servirse en una única GPU consumer o incluso en CPU mediante llama.cpp, útil para laboratorios y entornos de formación.
- Validación de pipelines de detección: el repositorio incluye detectores RandomForest (OTRF + EVTX-MITRE) que se ejecutan antes del LLM en el puente del gym, lo que permite montar una cadena detección clásica más razonamiento para experimentación.
- Investigación y reproducción metodológica: los artefactos de auditoría (`config/`, `evaluation/`, `training/`, `deployment/`) y el archivo `SHA256SUMS` permiten reproducir las evaluaciones y estudiar por qué un adaptador LoRA pequeño no supera al base en este dominio.
- Pruebas de regresión de cuantización: el conjunto de 15 alertas doradas sirve como banco de pruebas para comparar Q4_K_M, Q8_0 y BF16 con y sin adaptador antes de promover un cambio a producción.

## Benchmarks y rendimiento

| Prueba | Resultado |
|---|---|
| Golden test sintético (base + guardarraíles) | macro-F1 0,9541, cobertura 0,309 |
| Golden test sintético (adaptador piloto) | macro-F1 0,3788, cobertura 0,036 |
| Golden test sintético (adaptador de evidencia) | macro-F1 0,7828, cobertura 0,182 |
| Golden test de 15 alertas, ruta llama.cpp base Q4_K_M + LoRA | concordancia de etiquetas 93,3 % (14/15), JSON 100 %, contrato 100 %, 0 rechazos de guardarraíl |
| Golden test de 15 alertas, Q8_0 y BF16 con LoRA | concordancia de etiquetas 86,7 % en cada variante |
| Fusionado de un solo archivo (DEPRECATED) | 66,7 % de concordancia |
| SOC-AI-Gym v0.5.0, triaje en laboratorio real OTRF (84 ensayos) | éxito de tarea 0,214, FPR 0,0, ECE 0,575; 36/84 casos exceden el límite de contexto |
| SOC-AI-Gym fixtures de demostración (24 ensayos) | éxito de tarea 0,125 |
| SOCBench (DeepTempo), agente con herramientas, smoke estratificado | F1 de veredicto 0,667, precisión 1,00 |
| Detectores RandomForest OTRF-only | recall EVTX 24,6 %, accuracy OTRF 96,0 %, recall OTRF 100 %, FPR OTRF 14,3 % |
| Detectores RandomForest combinados | recall EVTX 100 %, accuracy OTRF 92,0 %, recall OTRF 94,4 %, FPR OTRF 14,3 % |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,5-6,5 GB con la base Q4_K_M (5,0 GB) más el adaptador LoRA F16 (3,3 MB) y la caché KV para 4096 tokens; en torno a 8-9 GB con Q8_0 y más de 15 GB con BF16.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM para Q4_K_M; RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 y H100 son válidas, aunque el modelo no aprovecha el paralelismo de las GPU de centro de datos.
- Cabe en GPU consumer: sí, en Q4_K_M con 8 GB o más; también es viable en CPU mediante llama.cpp, aunque con mayor latencia.
- Opciones de despliegue: llama.cpp (`llama-server` con `--lora`, `--jinja`, `--chat-template-file` y `-c 4096`) es la ruta validada; el autor menciona `mlx_lm.server` para el adaptador en MLX, con la advertencia de que solo aplica el adaptador si el identificador de modelo es `default_model`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| soc-triage-nemotron-bolt-e4b-lora-gguf (este) | 7.518 M (base) | 4096 tokens en despliegue validado | Triaje de alertas SOC con LoRA y guardarraíles | openmdw-1.1 | GGUF en Hugging Face; 588 descargas |
| nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16 (base) | 7.518 M | no disponible | Modelo generalista de NVIDIA | no disponible en la información | Pesos BF16 en Hugging Face |
| ggml-org/NVIDIA-Nemotron-3.5-Bolt-E4B-GGUF | 7.518 M | no disponible | Cuantizaciones oficiales del base para llama.cpp | no disponible en la información | GGUF en Hugging Face |
| Modelos de triaje SOC especializados de mayor tamaño | no disponible | no disponible | Triaje y enriquecimiento de alertas | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El adaptador no mejora al modelo base: la corrección del 2026-10-29 concluye explícitamente que debe usarse el base para calidad, ya que el adaptador obtuvo macro-F1 de 0,3788 y 0,7828 frente a 0,9541 del base con guardarraíles.
- Precisión en el mundo real no probada: el entrenamiento se realizó sobre 420 ejemplos sintéticos y el propio autor lo califica de no validado.
- Rendimiento débil en telemetría real: éxito de tarea de 0,214 en SOC-AI-Gym sobre laboratorio OTRF, con 36 de 84 casos que exceden el límite de contexto de 4096 tokens.
- Calibración pobre: ECE de 0,575 en la prueba de OTRF, lo que indica que las probabilidades declaradas no son fiables.
- Comportamiento muy conservador: tiende a abstenerse o clasificar como benigno, lo que reduce falsos positivos pero limita la cobertura útil.
- Alcance restringido a triaje: no está diseñado para caza de amenazas ni para razonamiento multi-paso sobre evidencia compleja.
- Solo inglés: no se documenta soporte de otros idiomas.
- Limitación de contexto: 4096 tokens en la configuración validada, insuficiente para alertas con telemetría extensa.
- Licencia openmdw-1.1: es necesario revisar sus términos antes de un uso comercial; la model card la etiqueta como `other`.
- Sin afiliación con NVIDIA ni Google: el autor lo declara explícitamente; no es un artefacto oficial.
- El archivo fusionado de un solo paso está DEPRECATED y solo se conserva como referencia.
- Los detectores RandomForest asociados están entrenados dentro del mismo dataset (OTRF de laboratorio y EVTX solo de ataque) y requieren validación con un SIEM real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/infosecn1nja/soc-triage-nemotron-bolt-e4b-lora-gguf
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Cuantizaciones oficiales del base: https://huggingface.co/ggml-org/NVIDIA-Nemotron-3.5-Bolt-E4B-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/infosecn1nja/soc-triage-opensec-chat
- Licencia openmdw-1.1: https://openmdw.ai/license/1-1/
- Descarga directa de Q8_0 del base: https://huggingface.co/ggml-org/NVIDIA-Nemotron-3.5-Bolt-E4B-GGUF/resolve/main/NVIDIA-Nemotron-3.5-Bolt-E4B-Q8_0.gguf
- Documento de corrección de evaluación: `evaluation/CORRECTION_2026-10-29.md` (dentro del repositorio)
- Kit L1 Copilot: `deployment/l1-copilot/` (dentro del repositorio)
- Detectores de telemetría: `detector/README.md` (dentro del repositorio)
