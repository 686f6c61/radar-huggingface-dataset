# jashepp/Qwen3.8-27B-super-adapter-Quants-LoRA-GGUF

## Resumen

`jashepp/Qwen3.8-27B-super-adapter-Quants-LoRA-GGUF` es un adaptador LoRA cuantizado en formato GGUF, publicado por el usuario jashepp, que se aplica sobre el adaptador original `harness-hub/Qwen3.8-27B-super-adapter` (a su vez pensado para modelos derivados de `Qwen/Qwen3.8-27B`). No es un modelo completo, sino un delta de pesos de 478.150.656 parametros (unos 478 M) que se carga junto al modelo base en tiempo de inferencia mediante `llama.cpp`. Su funcion es anadir sintaxis alternativa de tool calling para clientes agente como Pi, OpenCode y Hermes, de modo que no sea necesario emplear unicamente los modelos que dichos clientes soportan de forma nativa.

El interes practico del repositorio esta en la cuantizacion: frente al adaptador original publicado en safetensors y F16-GGUF, aqui se ofrecen versiones Q8_0, Q5_1 y Q4_1 del LoRA, con tamanos de 508 MB, 359 MB y 299 MB respectivamente, lo que reduce el coste en VRAM y en disco al combinarlo con modelos base ya cuantizados. El autor indica que por debajo de Q4_1 la tasa de alucinacion resulta excesiva y por eso no publico cuantizaciones mas agresivas tipo MXFP4.

La relevancia es acotada pero concreta: cubre un hueco de disponibilidad (no existian cuantizaciones Q8 o inferiores del adaptador suelto) y permite reutilizar el adaptador sobre merges y fine-tunes derivados de Qwen3.8-27B sin fusionarlo en el modelo base. La licencia es Apache-2.0 y el repositorio ocupa 3,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre modelos derivados de Qwen3.8-27B; pesos en GGUF |
| Parametros totales | 478.150.656 (adaptador LoRA, no el modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base Qwen3.8-27B) |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q5_1, Q4_1 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (adaptador LoRA suelto, no fusionado); repo base en safetensors |

## Arquitectura y entrenamiento

El adaptador se entrena con TRL usando GRPO y async-GRPO, segun las etiquetas y metadatos de la model card, sobre los datasets `harness-hub/scale800-harbor`, `harness-hub/harness-adapters`, `harness-hub/termgrade-train-harbor` y `ai-and/termgrade-environments`. El objetivo declarado es ensenar al modelo base a emitir tool calls con la sintaxis que esperan clientes agente concretos (Pi, OpenCode, Hermes), es decir, un ajuste orientado a la interfaz de llamada a herramientas mas que a capacidades generales.

Tecnicamente es un LoRA de rango bajo sobre las capas del transformer de Qwen3.8-27B, exportado a GGUF para cargarse con `lora-scaled` en `llama.cpp`. El autor modifico su fork de llama.cpp (commit `f2dc7826`) para poder generar las cuantizaciones Q5_1 y Q4_1 del adaptador, y senala que estas funcionan directamente en llama.cpp sin necesidad de cargar las capas en calidad completa. No se detalla en la informacion disponible el rango del LoRA, el numero de tokens de entrenamiento ni la composicion exacta de las recompensas de GRPO.

## Capacidades

- Inyeccion de sintaxis alternativa de tool calling para clientes agente (Pi, OpenCode, Hermes) sobre modelos derivados de Qwen3.8-27B.
- Compatibilidad con merges y fine-tunes de Qwen3.8-27B, sin necesidad de fusionar el adaptador en el modelo base.
- Carga combinada con otros adaptadores LoRA mediante multiples entradas `lora-scaled` con escalas independientes.
- Uso con modelos base ya cuantizados (Q8 o inferior), reduciendo el coste adicional en VRAM.
- Generacion de texto heredada del modelo base (pipeline `text-generation`); el adaptador no anade capacidades nuevas fuera del formato de llamada a herramientas.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Despliegue de agentes locales con OpenCode o Hermes: se carga el LoRA Q4_1 o Q5_1 junto a un Qwen3.8-27B cuantizado en `llama.cpp` para que el modelo emita llamadas a herramientas en la sintaxis que espera el cliente, sin cambiar de modelo base.
- Reutilizacion sobre fine-tunes de la comunidad: al no requerir fusion, se puede aplicar sobre merges como los publicados por jashepp o fine-tunes de terceros derivados de Qwen3.8-27B, manteniendo las modificaciones propias de cada variante.
- Entornos con VRAM ajustada: el adaptador Q4_1 ocupa 299 MB y, segun el autor, consume menos VRAM que su tamano en disco; permite anadir tool calling a un modelo ya cargado bajando la ventana de contexto entre 5k y 10k tokens si el margen es escaso.
- Pipelines de agentes con multiples adaptadores: la configuracion `lora-scaled` admite varios LoRA con escalas distintas (por ejemplo, el adaptador de herramientas a escala 1 y un segundo adaptador a 0,5), util para combinar comportamientos sin reentrenar.
- Prototipado de integraciones agente: sirve para validar el formato de tool call de un cliente concreto antes de invertir en un fine-tune completo o en un merge dedicado.
- Inferencia en estaciones de trabajo con GPU de consumo: al ser un delta pequeno sobre un modelo cuantizado, encaja en flujos de `llama.cpp` en local donde no es viable cargar el adaptador en F32.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM del adaptador: 299 MB (Q4_1), 359 MB (Q5_1), 508 MB (Q8_0), 656 MB (F16 y BF16). El autor indica que el consumo real en VRAM es inferior al tamano del fichero.
- VRAM total: depende del modelo base Qwen3.8-27B y de su cuantizacion; no disponible en la informacion proporcionada.
- GPU recomendadas: no disponibles. El unico backend documentado es `llama.cpp`, por lo que aplican las GPU soportadas por este (NVIDIA, AMD, Apple Silicon, CPU).
- GPU de consumo: viable en la medida en que lo sea el modelo base cuantizado; el adaptador en si no impone un salto de gama.
- Despliegue: `llama.cpp` con la opcion `lora-scaled` (soporta multiples adaptadores con escala). No se documentan vLLM, TGI ni Ollama en la informacion disponible.
- Ajuste fino de contexto: si la VRAM esta al limite, reducir la ventana entre 5k y 10k tokens segun las cuantizaciones de modelo y adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Cuantizaciones | Formato | Licencia |
|---|---|---|---|---|---|
| jashepp/Qwen3.8-27B-super-adapter-Quants-LoRA-GGUF | Adaptador LoRA cuantizado | 478 M (delta) | BF16, F16, Q8_0, Q5_1, Q4_1 | GGUF | Apache-2.0 |
| harness-hub/Qwen3.8-27B-super-adapter | Adaptador LoRA original | no disponible | safetensors (F32/BF16) | safetensors | Apache-2.0 (segun repo origen) |
| harness-hub/Qwen3.8-27B-super-adapter-GGUF | Adaptador LoRA en GGUF | no disponible | F16 | GGUF | Apache-2.0 (segun repo origen) |
| Qwen/Qwen3.8-27B | Modelo base completo | 27B (nominal) | las del ecosistema del base | safetensors / GGUF | no disponible |

La diferencia clave frente al adaptador original y su version F16-GGUF es la disponibilidad de cuantizaciones Q8_0, Q5_1 y Q4_1, que reducen el peso del adaptador entre un 22 % y un 54 % respecto a los 656 MB de F16. No hay datos de rendimiento comparado en la informacion disponible.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere un modelo base derivado de Qwen3.8-27B y no funciona por si solo.
- Por debajo de Q4_1 el autor reporta alucinaciones frecuentes; no se publicaron cuantizaciones mas agresivas (por ejemplo, MXFP4).
- Las cuantizaciones Q5_1 y Q4_1 se generaron con un fork propio de llama.cpp; conviene verificar la compatibilidad con la version de llama.cpp que se use en produccion.
- El adaptador esta orientado a la sintaxis de tool calling de clientes concretos (Pi, OpenCode, Hermes); su utilidad fuera de esos clientes no esta documentada.
- No se especifican idiomas soportados, sesgos conocidos ni tasas de alucinacion mas alla de la nota sobre cuantizaciones bajas.
- El contexto efectivo depende del modelo base; reducir la ventana 5k-10k tokens puede ser necesario para encajar el adaptador en VRAM.
- Licencia Apache-2.0 en el adaptador; las condiciones del modelo base Qwen3.8-27B deben comprobarse por separado antes de un uso comercial.
- Repositorio con 339 descargas y 1 like en el momento de la consulta: validacion comunitaria escasa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jashepp/Qwen3.8-27B-super-adapter-Quants-LoRA-GGUF
- Adaptador original (safetensors): https://huggingface.co/harness-hub/Qwen3.8-27B-super-adapter
- Adaptador original en GGUF (F16): https://huggingface.co/harness-hub/Qwen3.8-27B-super-adapter-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Articulo de Hugging Face sobre Harness Adapters: https://huggingface.co/blog/harness-adapters-at-scale
- Commit del fork de llama.cpp para Q5_1 y Q4_1: https://github.com/Jashepp/llama-cpp-misc/commit/f2dc7826ff617b7170160e6d2ee70f6b10e428c4
- Perfil del autor en Hugging Face: https://huggingface.co/jashepp
- Perfil del autor en GitHub: https://github.com/Jashepp
