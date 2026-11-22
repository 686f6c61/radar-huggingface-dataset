# bemor187/darkgarlic-llm-ps4

## Resumen

DarkGarlic LLM 1.20 es un paquete homebrew para PlayStation 4 que empaqueta el modelo huihui-ai/Huihui-Qwen3.5-9B-abliterated, una variante "abliterated" (con la dirección de rechazo eliminada de los pesos) del Qwen3.5-9B de Alibaba. Lo desarrolla bemor187 como fork de Garlic LLM, el motor de inferencia creado por Leonardo Alegría para ejecutar LLMs en la GPU de la PS4 mediante GoldHEN. El paquete incluye los pesos cuantizados a q4s, el binario del modelo, una interfaz de chat de texto y una API compatible con OpenAI en el puerto 8080 de la consola.

La relevancia del proyecto es fundamentalmente práctica y de nicho: demuestra que es posible ejecutar un modelo de 9.000 millones de parámetros en hardware de 2013 (la GPU AMD Jaguar de la PS4) con velocidades de decodificación de decenas de tokens por segundo. No se trata de un modelo nuevo entrenado desde cero, sino de un artefacto de distribución: un .pkg instalable de 4,9 GB con pesos ya cuantizados y un motor de inferencia adaptado a la arquitectura de la consola.

El modelo subyacente es Qwen3.5-9B en su variante abliterated de Huihui, con licencia Apache-2.0 en los pesos, mientras que la aplicación contenedora se distribuye bajo GPLv3. El proyecto está en fase muy temprana (cero descargas, un like en el momento de la consulta) y no aporta benchmarks propios sobre los pesos abliterated.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.5-9B, inferido del modelo base; detalles de atención no disponibles) |
| Parametros totales | 9.000 millones (9B, segun el nombre del modelo base) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | q4s (formato propio del motor Garlic LLM, incluido en el paquete como `qwen3.5-9b-q4s.bin`) |
| Idiomas soportados | Ingles (segun la model card y el tag de idioma) |
| Licencia | GPLv3 para la aplicacion; Apache-2.0 para los pesos |
| Formato de pesos | Binario cuantizado propietario del motor (`.bin`), no safetensors ni GGUF; distribuido dentro de un `.pkg` de PS4 |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.5-9B, un transformer denso de 9.000 millones de parámetros desarrollado por Alibaba, del que no se proporcionan en esta ficha detalles sobre número de tokens de entrenamiento, composición del dataset ni fases de alineación (RLHF/DPO). La variante utilizada es la abliterated de Huihui, que aplica una técnica de ablación direccional para eliminar la dirección de rechazo en el espacio de activaciones, de modo que el modelo deja de negarse a responder ciertos prompts que el modelo original rechazaría. Esta modificación no reentrena el modelo: actúa sobre los pesos para suprimir el comportamiento de rechazo.

La innovación técnica del artefacto no está en el modelo sino en el motor: Garlic LLM implementa kernels de GPU para la PS4 (APU AMD con GPU integrada) y un formato de cuantización propio (q4s) que permite cargar un modelo de 9B en la memoria de la consola. El paquete incluye también un archivo `qwen3.5-9b-mtp.bin`, presumiblemente relacionado con multi-token prediction o decodificación especulativa, aunque la model card no lo detalla. El autor no documenta el proceso de conversión ni los detalles del pipeline de cuantización.

## Capacidades

- Generación de texto conversacional multi-turno mediante la interfaz de chat incluida en la aplicación.
- Razonamiento y conocimiento general heredados de Qwen3.5-9B (sin benchmarks publicados en esta distribución).
- Generación de código: la model card cita mediciones de hasta 43 tokens/s en código con los pesos originales, lo que indica uso previsto para tareas de programación.
- API compatible con OpenAI expuesta en `http://<console-ip>:8080`, con endpoint `/health` y model id `Abliterated Qwen3.5-9B`.
- Comportamiento sin rechazo en prompts que el modelo original declinaría, por efecto de la abliteración.
- Soporte de dictado y respuestas habladas: no incluido en este paquete (los archivos de voz provienen del paquete Garlic LLM original).
- Soporte de tool calling, agentes y modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Servidor LLM local en red doméstica: la API compatible con OpenAI en el puerto 8080 permite conectar clientes existentes (scripts Python con el SDK de OpenAI, interfaces tipo Open WebUI) apuntando a la IP de la consola, sin necesidad de PC adicional encendido.
- Experimentación con modelos abliterated en hardware de bajo consumo: útil para investigadores que quieran estudiar el comportamiento de un modelo sin dirección de rechazo en un entorno aislado y desconectado.
- Generación de código asistida en un entorno sin internet: la velocidad citada de hasta 43 tokens/s en código con los pesos originales hace viable su uso como autocompletado o generación de fragmentos en un flujo de trabajo offline.
- Docencia y demostración de inferencia en hardware no convencional: sirve para ilustrar cuantización, kernels de GPU y despliegue de LLMs en una consola de 2013 con GoldHEN.
- Procesamiento de texto por lotes durante la noche: al ser un equipo dedicado y de bajo consumo, la consola puede ejecutar tareas de resumen o reescritura de documentos vía API sin ocupar el PC principal.
- Pruebas de robustez y seguridad: la variante abliterated permite evaluar cómo cambia la tasa de rechazo y la calidad de respuesta al eliminar la dirección de rechazo, comparando contra el Qwen3.5-9B original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo cita velocidades de decodificación medidas por Leonardo Alegría sobre los pesos originales de Qwen en una PS4 base o Slim: 31–39 tokens/s en chat y hasta 43 tokens/s en código. El autor indica explícitamente que no aporta nuevas mediciones para los pesos abliterated.

## Requisitos de hardware

- Hardware objetivo: PlayStation 4, PS4 Slim o PS4 Pro con GoldHEN instalado. El paquete no incluye exploit.
- Almacenamiento: el `.pkg` ocupa 4.898.750.464 bytes (aproximadamente 4,9 GB); se recomiendan unos 10 GB libres si la consola copia el paquete al disco interno antes de instalar.
- Instalación: copiar a un USB exFAT y usar Settings → Debug Settings → Game → Package Installer.
- VRAM: no aplica en el sentido habitual; el modelo se ejecuta en la memoria unificada de la APU de la PS4. No se documenta el consumo exacto.
- GPU de PC: no disponible; este artefacto no está pensado para ejecutarse en GPU convencionales.
- Opciones de despliegue: únicamente el motor Garlic LLM empaquetado; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 31–39 tokens/s en chat y hasta 43 tokens/s en código según mediciones del motor original con pesos Qwen sin abliterar; cifras no verificadas para esta build.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| DarkGarlic LLM 1.20 (este) | 9B | No disponible | Paquete PS4 con motor propio (q4s) | GPLv3 (app) / Apache-2.0 (pesos) | Solo PS4 con GoldHEN; abliterated |
| huihui-ai/Huihui-Qwen3.5-9B-abliterated | 9B | No disponible | Safetensors en Hugging Face | Apache-2.0 | Modelo base de esta build; requiere hardware convencional |
| Garlic LLM (Leonardo Alegría) | 9B (Qwen original) | No disponible | Paquete PS4 con motor propio | GPLv3 | Proyecto upstream; incluye voz, pesos sin abliterar |
| Qwen3.5-9B (Alibaba) | 9B | No disponible | Safetensors, GGUF en ecosistema | Apache-2.0 | Modelo original con rechazo intacto |

## Limitaciones y advertencias

- La abliteración elimina la dirección de rechazo de los pesos: el modelo responderá a prompts que el original rechazaría, lo que traslada al operador toda la responsabilidad sobre el filtrado de contenido.
- No hay benchmarks publicados para esta build; las cifras de velocidad citadas corresponden a los pesos originales y a mediciones de terceros, no verificadas aquí.
- Solo soporta inglés según la model card; el rendimiento en castellano no está documentado y probablemente sea degradado.
- Longitud de contexto no documentada; no se debe asumir la ventana nativa de Qwen3.5-9B sin verificación.
- Requiere una PS4 con GoldHEN; no funciona en firmware sin jailbreak ni en PS5.
- El paquete no incluye dictado ni respuestas habladas; esos archivos deben obtenerse del paquete Garlic LLM original.
- La licencia GPLv3 de la aplicación impone obligaciones de copyleft si se redistribuye el paquete o se modifica el motor; los pesos mantienen Apache-2.0, lo que exige revisar la compatibilidad al combinarlos en un producto.
- Riesgo de alucinación inherente a un modelo de 9B cuantizado a 4 bits, sin datos específicos de evaluación en esta distribución.
- Proyecto con cero descargas y un único like en el momento de la consulta: madurez y mantenimiento no contrastados.
- El contenido generado puede ser inapropiado por la supresión del rechazo; no se recomienda exponer la API en redes no confiables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bemor187/darkgarlic-llm-ps4
- Modelo base (abliterated): https://huggingface.co/huihui-ai/Huihui-Qwen3.5-9B-abliterated
- Repositorio del fork: https://github.com/bemor187/garlic-llm/tree/darkgarlic
- Proyecto upstream Garlic LLM: https://github.com/leonardo-alegria/garlic-llm
- Modelo original: https://huggingface.co/Qwen/Qwen3.5-9B
