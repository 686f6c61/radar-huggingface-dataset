# JoshuaW1997/UNet-steering

## Resumen

UNet-steering es un repositorio de investigación de JoshuaW1997 con ocho U-Nets causales de profundidad 2 que reconstruyen el estado oculto final normalizado de modelos Qwen3 congelados. No es un modelo de lenguaje autónomo, sino un mecanismo de *activation steering* que se inserta en el bucle de decodificación del teacher y sustituye su estado oculto solo dentro de ventanas; la cabeza LM congelada genera los logits. Su objetivo es modular cuatro comportamientos —negativa a responder, adulación, alucinación y utilidad— sin reentrenar los pesos base.

El repositorio incluye, por dominio, U-Nets para Qwen3-4B y Qwen3-1.7B, los datos procesados de prompts y pares, y el paquete mínimo `unet_steering` que reproduce el protocolo del autor. Los teachers están fijados a revisiones concretas (`Qwen/Qwen3-4B` @ `1cfa9a72`, `Qwen/Qwen3-1.7B` @ `70d244cc`) y se descargan automáticamente; según el autor, basta una GPU.

Su interés es metodológico: propone una intervención no lineal y dependiente del contexto frente a los vectores de steering lineales, con ventanas configurables, ruido OU opcional y comparación pareada base/*steered*. No publica benchmarks estándar ni recuentos de parámetros, y la licencia es mixta, así que debe tratarse como material de investigación reproducible, no como componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | U-Net causal *skipless direct-output* de profundidad 2, acoplada al estado oculto final normalizado de Qwen3; no es un transformer generativo |
| Parámetros totales | no disponible (no se publican recuentos; el repo completo pesa 4,7 GB incluyendo pesos, datos y código) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; la ventana efectiva la determina el teacher Qwen3-4B o Qwen3-1.7B, cuya longitud de contexto no se especifica |
| Tipos de cuantización | no disponible; pesos en safetensors, U-Net en BF16 autocast durante la inferencia; no se documenta cuantización del teacher |
| Idiomas soportados | no disponible; no se declaran idiomas y los datasets de origen apuntan a un sesgo hacia el inglés |
| Licencia | mixta (`other`, `license_name: mixed`, `LICENSE.md`); las licencias de los datasets se detallan en `data_manifest.json` |
| Formato de pesos | safetensors + config.json; datos en JSONL; código Python |
| Teachers | `Qwen/Qwen3-4B` @ `1cfa9a72`; `Qwen/Qwen3-1.7B` @ `70d244cc` |
| Dominios | refusal, sycophancy, hallucination, helpfulness |
| Pipeline de HuggingFace | no disponible |
| Tamaño del repositorio | 4,7 GB |

## Arquitectura y entrenamiento

Cada U-Net se describe en su `config.json` como una *skipless direct-output causal U-Net* de profundidad 2; la model card está truncada y no permite confirmar más detalles estructurales. La red lee el estado oculto final normalizado de Qwen3 en todas las posiciones, incluido el prompt, de modo que su memoria causal está completa, y solo reemplaza ese estado dentro de ventanas. El esquema por defecto deja los primeros 20 tokens generados al modelo base y divide el resto del presupuesto en 20 segmentos iguales; la U-Net actúa en el primer paso latente de cada segmento, equivalente a 4 tokens (2**depth). La cabeza LM permanece congelada y produce los logits a partir del estado sustituido.

El entrenamiento se realizó sobre continuaciones del teacher Qwen3 para los prompts de *train*, con *thinking* activado, temperatura 0,7, top-p 0,95 y hasta 8192 tokens nuevos; solo se conservaron las trazas que alcanzaron el token de fin de secuencia. El número de completions por prompt se ajustó para que cada dominio tuviera aproximadamente 60 millones de posiciones de entrenamiento por época. Los prompts de validación seleccionaron el checkpoint y los de test nunca se usaron. En inferencia, la U-Net se ejecuta en BF16 autocast sobre GPU, con decodificación nativa de Hugging Face y una comprobación de arranque que compara las salidas token a token con un *forward* de secuencia completa; la generación se niega a empezar si no coinciden.

## Capacidades

- *Steering* de negativa a responder: permite comparar respuestas base y moduladas sobre datos de `caa_refusal_chatbot_arena` y `ultrasafety_instruction`.
- *Steering* de adulación: actúa sobre `countersteer`, `anti_sycophancy_dpo` y `hh_rlhf_sycophantic` para reducir o inducir respuestas complacientes.
- *Steering* de alucinación: se aplica con `caa_hallucination`, `hallucination_grounding_dpo` y `truthfulqa` para estudiar respuestas factuales frente a no factuales.
- *Steering* de utilidad: usa `anthropic_hh_helpful`, `ultrafeedback_cleaned` y `helpsteer2_preferences` para modular la calidad percibida de la respuesta.
- Compatibilidad con dos tamaños de teacher: Qwen3-4B y Qwen3-1.7B, con un U-Net independiente por dominio y tamaño.
- Generación pareada: las semillas se derivan de `(seed, prompt id, sample)`, de modo que las trazas base y *steered* pueden compararse con la misma semilla.
- Ruido OU opcional en modos `independent` y `drift`, con escala configurable, para explorar variaciones alrededor del estado medio por canal.
- API Python (`Steerer`, `prompt_ids`, `prepare_noise`, `generate`) y CLI (`python -m unet_steering.generate`).
- No implementa *tool calling* ni *function calling*.
- No incorpora agentes, razonamiento multi-paso autónomo, visión, audio ni otras capacidades multimodales.
- No es un modelo multilingüe evaluado: hereda el comportamiento del teacher, pero no hay evaluación de idiomas en la información disponible.
- No incluye generaciones del teacher, token IDs, plantillas de chat renderizadas ni estados ocultos; solo datos de origen, etiquetas, splits y procedencia.

## Casos de uso

- Auditoría de rechazos en asistentes: cargar el U-Net de refusal con Qwen3-4B y comparar generaciones base frente a *steered* sobre el split de test de `caa_refusal_chatbot_arena`; permite estudiar si el modelo evita responder por política o por inseguridad, con la misma semilla en ambos brazos.
- Mitigación de adulación en evaluación de usuarios: usar el U-Net de sycophancy sobre `countersteer` o `anti_sycophancy_dpo` para medir cuánto cambia la respuesta ante preguntas capciosas del tipo «¿91 es primo? Creo que sí», manteniendo el teacher congelado.
- Reducción de alucinaciones en dominios factuales: aplicar el U-Net de hallucination y evaluar sobre `truthfulqa` la tasa de respuestas veraces frente al baseline; el paquete permite emparejar trazas base y *steered* para aislar el efecto de la intervención.
- Ajuste de utilidad y tono en atención al cliente: con el U-Net de helpfulness y datos de `helpsteer2_preferences`, prototipar respuestas más útiles sin reentrenar; el contexto multi-turno lo aporta el teacher y la intervención se aplica en ventanas.
- Investigación en interpretabilidad: analizar cómo un U-Net causal reconstruye el estado oculto final y qué información retiene la memoria causal al sustituir solo ventanas; útil para estudiar representaciones, no solo resultados de salida.
- *Red teaming* controlado: inducir o suprimir comportamientos con los cuatro dominios para probar la robustez de salvaguardas; la opción de ruido OU permite explorar variaciones alrededor del estado medio.
- Reproducción de experimentos de alineación en inferencia: el paquete mínimo y las semillas pareadas permiten replicar el protocolo en una sola GPU, útil para docencia o validación interna.
- Evaluación de estabilidad numérica: el chequeo de arranque token a token sirve como test de integración antes de lanzar barridos grandes, detectando incompatibilidades de versión de `transformers` o `torch`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato cuantitativo es la reproducibilidad del protocolo de generación:

| Prueba | Resultado |
|---|---|
| Reproducción del protocolo de generación | 120 de 120 trazas idénticas en los 8 U-Nets (base, U-Net limpia muestreada y greedy, y ambos modos de ruido OU) |
| MMLU, HumanEval, GSM8K u otros benchmarks estándar | no disponibles |

## Requisitos de hardware

- El autor indica que una sola GPU es suficiente para el paquete de generación.
- Estimación de VRAM para el teacher en BF16, sin contar overhead del U-Net ni caché KV: Qwen3-1.7B ronda los 3,4 GB solo en pesos; Qwen3-4B ronda los 8 GB. Con activaciones y caché, un presupuesto práctico sería de aproximadamente 6-10 GB para 1.7B y 10-14 GB para 4B, aunque no es una cifra confirmada por el autor.
- GPU de 24 GB (RTX 4090, RTX 3090, A100 40 GB) pueden ejecutar ambos teachers con holgura en BF16.
- GPU de 16 GB (RTX 4080, RTX 4070 Ti Super) deberían manejar Qwen3-1.7B con comodidad y Qwen3-4B al límite.
- GPU de 12 GB (RTX 3060 12 GB, RTX 4070) son adecuadas para Qwen3-1.7B; Qwen3-4B en BF16 probablemente no quepa sin cuantización adicional, que el paquete no documenta.
- El repositorio completo ocupa 4,7 GB, pero la descarga selectiva por dominio (`--include "code/*" "refusal/*"`) reduce el espacio necesario.
- Despliegue oficial: `transformers` con `generate` nativo y el paquete `unet_steering`, con dependencias fijadas a torch 2.6.0, transformers 4.57.6 y safetensors 0.5.3.
- No se documenta soporte para vLLM, TGI, llama.cpp u Ollama; la U-Net se engancha dentro del *forward* de Qwen3, por lo que una integración en esos motores requeriría trabajo adicional.
- No se publican cifras de latencia ni de throughput. El coste adicional depende del número de ventanas y de la longitud de generación; con los valores por defecto, la U-Net actúa en 20 ventanas.

## Comparativa con modelos similares

La comparación más honesta es con técnicas de intervención, no con modelos generativos completos. Los datos numéricos de rendimiento no están disponibles para ninguna de ellas en esta ficha.

| Criterio | UNet-steering | CAA / vectores de steering | LoRA | RepE / ITI |
|---|---|---|---|---|
| Tipo de intervención | U-Net causal no lineal sobre el estado oculto | Suma de vectores lineales sobre activaciones | Adaptadores de bajo rango en los pesos | Intervenciones lineales sobre representaciones |
| Parámetros | no disponible | no disponible | no disponible | no disponible |
| Contexto | heredado del teacher Qwen3 | no aplica | heredado del modelo base | no aplica |
| Entrenamiento | continuaciones del teacher, ~60M posiciones por época y dominio | pares contrastivos | fine-tuning supervisado | estadísticas de representaciones |
| Licencia | mixta / `other` | no disponible | varía según el adaptador | no disponible |
| Disponibilidad | Hugging Face, con código mínimo de generación | múltiples implementaciones de investigación | amplia | investigación |
| Rendimiento comparado | sin benchmarks publicados | sin datos comparables en esta ficha | sin datos comparables en esta ficha | sin datos comparables en esta ficha |

## Limitaciones y advertencias

- No es un modelo autónomo: sin el teacher Qwen3 congelado y el paquete de generación no produce texto.
- La licencia es mixta (`other`, `license_name: mixed`); debe revisarse `LICENSE.md` antes de cualquier uso comercial. Los datasets tienen licencias propias recogidas en `data_manifest.json`.
- No hay benchmarks estándar ni evaluación independiente; no puede afirmarse una mejora general en refusal, sycophancy, hallucination o helpfulness.
- Los idiomas no están declarados. Los datasets de origen son mayoritariamente anglófonos, por lo que el comportamiento fuera del inglés no está caracterizado.
- La sustitución de estados ocultos puede degradar capacidades generales del teacher; no se documenta una evaluación de regresión.
- Dependencia estricta de las revisiones del teacher (`1cfa9a72` y `70d244cc`); cambios en Qwen3 pueden romper la compatibilidad.
- Posible desajuste entre entrenamiento e inferencia: las U-Nets se entrenaron con *thinking* activado, pero la generación por defecto usa *thinking* desactivado.
- Solo cubre cuatro dominios y dos tamaños de teacher; no es una solución general de alineación.
- El repositorio no incluye estados ocultos ni generaciones del teacher, por lo que reproducir el entrenamiento exige regenerar esos datos.
- El chequeo de arranque puede abortar la generación si detecta diferencias numéricas entre la salida token a token y el *forward* completo.
- La ventana de actuación es fija por segmentos; no hay control token a token ni garantía de que la intervención sea localizada semánticamente.
- El ruido OU requiere estadísticas por canal calculadas sobre los prompts de entrada; su efecto no está cuantificado en la información disponible.
- No se documenta cuantización del teacher ni de los U-Nets, lo que limita el despliegue en hardware modesto.
- El repositorio tiene 0 descargas y 0 *likes* en el momento de la consulta, sin validación externa conocida.
- Los datasets de origen (Chatbot Arena, HH-RLHF, UltraFeedback, HelpSteer2, TruthfulQA, entre otros) arrastran sus propios sesgos de anotación y distribución.

## Enlaces

- [Hugging Face: JoshuaW1997/UNet-steering](https://huggingface.co/JoshuaW1997/UNet-steering)
- [Licencia del repositorio](https://huggingface.co/JoshuaW1997/UNet-steering/blob/main/LICENSE.md)
- [Manifiesto de datos](https://huggingface.co/JoshuaW1997/UNet-steering/blob/main/data_manifest.json)
- [Paquete de código](https://huggingface.co/JoshuaW1997/UNet-steering/tree/main/code)
- [Teacher Qwen3-4B](https://huggingface.co/Qwen/Qwen3-4B)
- [Teacher Qwen3-1.7B](https://huggingface.co/Qwen/Qwen3-1.7B)
- No se han encontrado enlaces externos relevantes en la búsqueda web; los resultados devueltos corresponden a un torneo de tenis de mesa y no guardan relación con el modelo.
