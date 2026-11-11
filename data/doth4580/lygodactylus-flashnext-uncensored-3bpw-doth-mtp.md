# doth4580/Lygodactylus-FlashNext-Uncensored-3bpw-DotH-MTP

## Resumen

Lygodactylus-FlashNext-Uncensored-3bpw-DotH-MTP es un paquete de pesos cuantizados en formato EXL3 (ExLlamaV3) a 3 bits por peso, derivado del modelo Qwen3.8-Flash-Next en su variante sin censura publicada por orcarouter. El paquete lo distribuye el usuario doth4580 y combina tres piezas: los pesos cuantizados por Lygodactylus con exllamav3, la base sin censura de orcarouter y una cabeza de borrador (draft head) para decodificacion especulativa reentrenada por doth4580 a partir de su propio MTP en BF16.

El modelo subyacente es un transformer de tipo mixture-of-experts (MoE) con 26.217.726.720 parametros totales y una ventana de contexto que el motor de inferencia de referencia configura hasta 262.144 tokens. La innovacion principal del paquete es la integracion de una cabeza MTP (multi-token prediction) optimizada para decodificacion especulativa, que acelera la generacion sin alterar la salida final, ya que cada token propuesto se verifica contra el modelo completo.

El paquete esta pensado y probado especificamente para veloGB10, un motor de inferencia OpenAI-compatible orientado a una, dos o cuatro maquinas NVIDIA DGX Spark / GB10. Su relevancia actual radica en que permite desplegar un MoE de 26.000 millones de parametros con contexto muy largo en hardware de escritorio de gama alta (GB10) con velocidades de decodificacion medidas entre 77 y 131 tokens por segundo segun la topologia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con cabeza MTP para decodificacion especulativa |
| Parametros totales | 26.217.726.720 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (configurado en veloGB10 con `--max-seq-len 262144`) |
| Tipos de cuantizacion | EXL3 a 3 bits por peso (3 bpw) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como `other` en la model card, con enlace a la licencia de Qwen) |
| Formato de pesos | safetensors en formato EXL3 (ExLlamaV3), con `model.safetensors.index.json` |
| Tamano del repositorio | 72,5 GB |
| Modelo base | orcarouter/Qwen3.8-Flash-Next-Uncensored y doth4580/Qwen3.8-Flash-Next-DotH-MTP-BF16 (merge) |
| Motor de referencia | veloGB10 (`gb10_inference`) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer de mezcla de expertos (MoE) de Qwen, del que este paquete solo redistribuye pesos cuantizados; no se ha reentrenado el modelo principal. La cuantizacion la realizo Lygodactylus con exllamav3 (revision `fe57295cac`) y se redistribuye byte a byte identica. Sobre esa base, doth4580 anade una cabeza de borrador MTP: 59 tensores no-expertos de su cabeza Flash-Next MTP re-destilada, cuantizados con exllamav3 1.5.3 al diseno y anchuras de la cabeza optimizada de HermiHg (Apache-2.0). La proyeccion del indexador conserva los bytes de HermiHg sin cambios, mientras que los expertos enrutados de la capa MTP permanecen los del propio paquete.

La innovacion tecnica destacable es la decodificacion especulativa con verificacion completa: la cabeza MTP propone tokens que el modelo completo valida, de modo que la cabeza afecta unicamente a la velocidad y nunca a la salida. En las pruebas del autor la tasa de aceptacion del borrador se situa en torno al 70 % (70,2 % en TP=1, 71,0 % en TP=2, 70,0 % en TP=4). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto autoregresiva con contexto largo de hasta 262.144 tokens.
- Razonamiento multi-turno con modo "thinking" activado por defecto en las pruebas de rendimiento del autor.
- Generacion de codigo (la model card reporta una medicion especifica de "code turn decode").
- Variante sin censura: el modelo base ha sido modificado por orcarouter para eliminar rechazos y restricciones de contenido.
- Decodificacion especulativa integrada mediante cabeza MTP, con `--mtp=auto` en veloGB10.
- Soporte de prefix caching (`--prefix-cache on`) para reutilizar prefijos en conversaciones multi-turno.
- Servidor compatible con la API de OpenAI (`/v1`), lo que habilita integracion con clientes existentes.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponible.
- Idiomas soportados: no disponible.

## Casos de uso

- Despliegue en hardware DGX Spark / GB10: el paquete esta disenado y probado para veloGB10 en una, dos o cuatro maquinas GB10, con instrucciones concretas de arranque en modo servidor y nodo. Es adecuado cuando se dispone de este hardware y se quiere maxima velocidad con contexto largo.
- Analisis de documentos extensos: con 262.144 tokens de contexto configurados, permite procesar libros completos, bases de codigo o expedientes largos en una sola pasada sin fragmentacion.
- Generacion de codigo en pipelines locales: la medicion "code turn decode" de 136-209 tok/s segun topologia indica que es viable para asistentes de codigo interactivos servidos desde una maquina local.
- Investigacion sobre decodificacion especulativa: el paquete incluye la cabeza MTP y los datos de aceptacion medidos, lo que lo convierte en un banco de pruebas reproducible para estudiar el impacto de las cabezas de borrador en el throughput.
- Experimentacion con modelos sin censura: para investigadores que estudian el comportamiento de modelos alineados frente a no alineados, la variante de orcarouter elimina los rechazos por politica de contenido.
- Servicio OpenAI-compatible en red local: el servidor expone `/v1` en el puerto 9000, lo que permite conectarlo a clientes y frameworks existentes sin adaptadores.
- Escalado horizontal por tensor parallelism: con TP=2 y TP=4 el autor reporta incrementos de prefill de 2.044 a 3.976 tok/s, util para servir cargas concurrentes en un pequeno cluster de GB10.

## Benchmarks y rendimiento

Datos medidos por el autor con veloGB10 0.7.7 sobre GB10 (2026-11-05), con muestreo de produccion, thinking activado y una peticion a la vez salvo en la columna agregada. La decodificacion incluye decodificacion especulativa; variacion aproximada de ±10 %.

| Topologia | Fuente del borrador | Decode turno de codigo (tok/s) | Decode turno de historia (tok/s) | Mediana decode todos los turnos (tok/s) | Prefill (tok/s) | 2 peticiones, agregado (tok/s) | Aceptacion del borrador |
|---|---|---:|---:|---:|---:|---:|---:|
| TP=1 | Cabeza DotH-MTP | 136 | 70 | 77 | 2.044 | 117 | 70,2 % |
| TP=2 | Cabeza DotH-MTP | 168 | 91 | 107 | 3.360 | 155 | 71,0 % |
| TP=4 | Cabeza DotH-MTP | 209 | 116 | 131 | 3.976 | 185 | 70,0 % |

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 72,5 GB en disco; con cuantizacion EXL3 a 3 bpw, el peso en memoria es del orden de decenas de GB, aunque no se especifica la cifra exacta de VRAM necesaria en la informacion proporcionada.
- GPU recomendadas: NVIDIA DGX Spark / GB10, en configuraciones de 1, 2 o 4 maquinas con tensor parallelism (TP=1, TP=2, TP=4).
- Compatibilidad con GPU de consumo (RTX 4090, etc.): no disponible en la informacion proporcionada.
- Opciones de despliegue: veloGB10 (`gb10_inference`) es el motor de referencia y el unico probado por el autor. Al ser formato EXL3 estandar, cualquier framework que lea ExLlamaV3 podria cargarlo, aunque no se documenta soporte verificado.
- Red: en TP=2 y TP=4 los nodos no necesitan copia del modelo; el nodo cabeza envia a cada nodo solo su parte de los pesos y la cachea localmente. Se soporta RoCE con seleccion de rail mediante `--rdma-dev`.
- Latencia y throughput: prefill de 2.044 a 3.976 tok/s y decode mediano de 77 a 131 tok/s segun topologia (ver tabla de benchmarks).
- Parametros de servidor probados: `--max-batch 2`, `--max-tokens 65536`, `--prefix-cache on`, `--mtp=auto`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Lygodactylus-FlashNext-Uncensored-3bpw-DotH-MTP (este) | 26,2 B | 262.144 | EXL3 3 bpw | qwen-community-1.0 | Incluye cabeza MTP para decodificacion especulativa; probado en GB10 |
| doth4580/Lygodactylus-FlashNext-Uncensored-3bpw | 26,2 B | no disponible | EXL3 3 bpw | qwen-community-1.0 | Mismos pesos sin la cabeza de borrador; misma salida, menor velocidad |
| orcarouter/Qwen3.8-Flash-Next-Uncensored | no disponible | no disponible | BF16 (original) | qwen-community-1.0 | Modelo base sin cuantizar ni cabeza MTP |
| doth4580/Qwen3.8-Flash-Next-DotH-MTP-BF16 | no disponible | no disponible | BF16 | qwen-community-1.0 | Cabeza MTP re-destilada en BF16, origen del borrador de este paquete |

No se dispone de datos de rendimiento de los modelos comparables en la informacion proporcionada, por lo que la comparativa se limita a parametros, formato y licencia.

## Limitaciones y advertencias

- Modelo sin censura: la variante de orcarouter elimina las restricciones de contenido del modelo original; puede generar contenido inapropiado, ofensivo o inseguro sin rechazo. No es apto para aplicaciones orientadas al publico sin filtros adicionales.
- Riesgo de alucinacion: no se documentan evaluaciones de fidelidad factual; al ser un derivado sin censura y cuantizado a 3 bpw, la degradacion por cuantizacion puede afectar a la precision en tareas sensibles.
- La cuantizacion a 3 bits por peso introduce perdida de calidad respecto al BF16 original; no se publican metricas de degradacion.
- La cabeza MTP solo afecta a la velocidad, no a la calidad de salida, pero su tasa de aceptacion (~70 %) implica que un 30 % de los tokens propuestos se descartan y se recalculan.
- Licencia qwen-community-1.0: conviene revisar sus terminos antes de uso comercial; la model card la etiqueta como `other` con enlace a la licencia de Qwen.
- El paquete esta probado unicamente con veloGB10 sobre GB10; el rendimiento en otras GPU o frameworks no esta verificado.
- Idiomas soportados no documentados: no se puede garantizar calidad multilingue fuera del ingles y el chino sin evaluacion propia.
- El autor declara explicitamente que no reclama propiedad intelectual sobre el paquete.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion independiente de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/doth4580/Lygodactylus-FlashNext-Uncensored-3bpw-DotH-MTP
- Paquete base sin cabeza MTP: https://huggingface.co/doth4580/Lygodactylus-FlashNext-Uncensored-3bpw
- Pesos EXL3 originales de Lygodactylus: https://huggingface.co/Lygodactylus/Qwen3.8-Flash-Next-Uncensored-exl3-3bpw
- Modelo sin censura de orcarouter: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Modelo Qwen original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia Qwen Community 1.0: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Cabeza MTP en BF16 de doth4580: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-DotH-MTP-BF16
- Cabezas MTP optimizadas de HermiHg: https://huggingface.co/HermiHg/Qwen3.8-Flash-Next-Optimized-MTP-Heads-exl3
- Motor de inferencia veloGB10: https://github.com/sf-stav/veloGB10
- exllamav3: https://github.com/turboderp-org/exllamav3
