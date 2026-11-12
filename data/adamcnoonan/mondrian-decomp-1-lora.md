# adamcnoonan/mondrian-decomp-1-lora

## Resumen

Mondrian Decomp 1 es un adaptador LoRA de rango 16 desarrollado por Adam Noonan sobre el modelo base Qwen/Qwen3.5-35B-A3B. No se trata de un modelo independiente, sino de un ajuste fino ligero (PEFT) cuyo objetivo es especializar al modelo base en la generación de bocetos p5.js que pintan composiciones de estilo Mondrian: barras negras sobre lienzo claro con planos planos de rojo, amarillo y azul. El adaptador no produce píxeles directamente, sino código JavaScript que, al ejecutarse, dibuja la composición.

El modelo se entrenó mediante clonación de comportamiento filtrada: 118 filas provenientes de 101 bocetos que el propio modelo base había generado y que el autor evaluó a ciegas como "love" (17) u "okay" (84). Se usó un LoRA de rango 16, alpha 32, dropout 0.05, aplicado a las proyecciones `q_proj`, `k_proj`, `v_proj` y `o_proj`, durante 3 épocas y 88 pasos sobre una única máquina AMD Strix Halo con ROCm.

Es relevante como caso práctico de ajuste fino de bajo coste y de evaluación rigurosa: el autor documenta que el adaptador no superó al modelo base (diferencia media de valoración de −0.006, intervalo bootstrap del 95 % de −0.175 a +0.163), lo que convierte esta ficha en un ejemplo útil de resultado negativo bien medido en lugar de una mejora demostrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer del modelo base Qwen/Qwen3.5-35B-A3B |
| Parametros totales | 3.440.640 (solo el adaptador; el modelo base no se incluye en el repo) |
| Parametros activos | no disponible (el modelo base es MoE, pero el adaptador no especifica el reparto de expertos) |
| Longitud de contexto | no disponible (heredada del modelo base, no documentada en la model card) |
| Tipos de cuantizacion | adaptador en safetensors y GGUF (Q8_0 del base en el flujo de uso documentado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`) y GGUF (`adapter.gguf`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 con alpha 32 y dropout 0.05, inyectado en las cuatro proyecciones de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`) del modelo base Qwen/Qwen3.5-35B-A3B, usando únicamente los módulos de lenguaje (los módulos de visión quedan excluidos). El entrenamiento empleó tasa de aprendizaje 1e-4 con decaimiento coseno, 5 % de warm-up, acumulación de gradiente 4, 3 épocas y 88 pasos; la pérdida media por época fue 0.175, 0.163 y 0.155. Todo el ajuste se ejecutó en una sola máquina AMD Strix Halo (gfx1151, ROCm).

El conjunto de datos consta de 118 filas derivadas de 101 bocetos generados por el modelo base y evaluados a ciegas por el autor: 17 catalogados como "love" (duplicados en el dataset) y 84 como "okay". Cada fila contiene el system prompt del proyecto (`system_prompt.txt`), una petición de usuario y el boceto p5.js correspondiente. Se trata, por tanto, de clonación de comportamiento filtrada: el modelo aprende de sus propias salidas que un evaluador humano consideró aceptables. No se documenta uso de RLHF ni DPO.

## Capacidades

- Generación de código p5.js especializado en composiciones de estilo Mondrian sobre lienzo de 800 × 800.
- Producción de bocetos con barras negras, lienzo claro y planos planos de rojo, amarillo y azul, respetando un conjunto restringido de funciones permitidas.
- Seguimiento de instrucciones compositivas concretas (por ejemplo, "un plano rojo alto en el borde izquierdo y un plano amarillo pequeño abajo a la derecha").
- Escritura de código ejecutable listo para pegar en el editor de p5.js.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo thinking en el adaptador.
- Capacidades multilingües: no disponibles.
- El adaptador está pensado para ejecutarse con el modo thinking desactivado y temperatura 1.0.

## Casos de uso

- Generación de arte generativo paramétrico: el adaptador escribe bocetos p5.js que reproducen el lenguaje visual de Mondrian, útiles para producir series de composiciones de forma automatizada y reproducible.
- Prototipado rápido de sketches creativos: un artista o diseñador puede pedir variaciones compositivas concretas (posición, color y tamaño de planos) y obtener código listo para ejecutar en el editor de p5.js.
- Docencia de arte generativo y programación creativa: sirve como ejemplo de cómo un LoRA sobre un modelo grande puede especializarse en un dominio visual muy acotado y como caso de estudio de clonación de comportamiento filtrada.
- Investigación en evaluación de ajuste fino: el resultado negativo documentado (diferencia de −0.006 con intervalo bootstrap de −0.175 a +0.163) lo convierte en un caso de referencia para diseñar experimentos con evaluación ciega y comparación estadística frente al modelo base.
- Generación de datasets sintéticos de código p5.js: puede producir bocetos etiquetados por estilo para alimentar otros pipelines de entrenamiento o de evaluación.
- Integración en flujos de llama.cpp: al disponer de `adapter.gguf`, puede cargarse junto a una cuantización Q8_0 del modelo base mediante `llama-server -m ... --lora adapter.gguf`, lo que facilita su despliegue en entornos locales.
- Reproducción de experimentos de bajo coste: el entrenamiento completo cabe en una sola máquina AMD Strix Halo con ROCm, lo que lo hace útil como plantilla para ajustes finos pequeños en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta una evaluación humana ciega: con 20 prompts nuevos y 8 bocetos por prompt y modelo, la diferencia de valoración media del modelo ajustado menos el base fue de −0.006 (intervalo bootstrap del 95 % de −0.175 a +0.163); el autor valoró positivamente el 62.5 % de los bocetos del modelo ajustado frente al 65.0 % del base.

## Requisitos de hardware

- El adaptador en sí ocupa muy poco espacio (repo de 0.0 GB; 3.440.640 parámetros), pero requiere cargar el modelo base Qwen/Qwen3.5-35B-A3B para funcionar.
- El flujo documentado usa una cuantización Q8_0 del modelo base con llama.cpp, lo que implica un consumo de memoria elevado, no cuantificado en la model card.
- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible; el entrenamiento se realizó en una AMD Strix Halo (gfx1151, ROCm).
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: llama.cpp (`llama-server` con `--lora adapter.gguf`); el adaptador PEFT en safetensors es compatible con el ecosistema PEFT/Hugging Face, aunque no se documentan otros servidores como vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mondrian Decomp 1 (este adaptador) | 3.440.640 (adaptador LoRA) | no disponible | Evaluación humana ciega: −0.006 frente al base (no mejora) | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-35B-A3B (modelo base) | no disponible en la información proporcionada | no disponible | Referencia de comparación del adaptador | no disponible en la información proporcionada | Hugging Face |
| Otros adaptadores LoRA de generación de código p5.js | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El adaptador no superó al modelo base en la evaluación ciega del autor; la mejora en calidad es indistinguible del ruido estadístico según el intervalo bootstrap reportado.
- El dataset de entrenamiento es muy pequeño (118 filas de 101 bocetos) y procede de las propias salidas del modelo base, lo que limita la diversidad y puede reforzar sesgos del base.
- Riesgo de alucinación y de generar código p5.js no ejecutable o que use funciones fuera del conjunto permitido; la model card insiste en restringir las funciones disponibles.
- El adaptador no produce imágenes directamente: requiere ejecutar el código generado en un entorno p5.js.
- No se documentan idiomas soportados ni comportamiento multilingüe.
- No se documentan la longitud de contexto ni el rendimiento en tareas ajenas al estilo Mondrian.
- Aunque la licencia es Apache 2.0, el uso comercial debe verificar también las condiciones del modelo base Qwen/Qwen3.5-35B-A3B, no detalladas en la información disponible.
- El adaptador se entrenó excluyendo los módulos de visión del modelo base, por lo que no debe esperarse comportamiento multimodal.
- El flujo documentado asume modo thinking desactivado y temperatura 1.0; otros ajustes de inferencia no han sido evaluados.

## Enlaces

- Hugging Face: https://huggingface.co/adamcnoonan/mondrian-decomp-1-lora
- Serie Mondrian Decomp 1: https://adamnoonan.xyz/art/mondrian-decomp/
- Editor de p5.js: https://editor.p5js.org/
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
