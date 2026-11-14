# qontack/agrinexa-pluto-gemma

## Resumen

AgriNexa Pluto es una redistribución del modelo Gemma 3 4B instructivo de Google, publicada por qontack (TerraSync Software Development Services) para su uso dentro de la aplicación de estudio AgriNexa. No se trata de un modelo nuevo ni de un fine-tuning: los pesos son idénticos a `gemma-3-4b-it-Q4_K_M.gguf` del repositorio oficial de ggml-org, y el único cambio es el troceado del archivo GGUF en seis partes de como máximo 512 MB mediante `llama-gguf-split`.

La motivación es puramente de despliegue en navegador: la aplicación carga el modelo en el dispositivo del usuario con wllama, y los navegadores no pueden mantener en memoria un archivo único superior a 2 GB. Al unir las seis partes se recupera el archivo original, verificable por el SHA-256 `882e8d2db44dc554fb0ea5077cb7e4bc49e7342a1f0da57901c0802ea21a0863`.

Por tanto, la relevancia técnica del repositorio es la de un artefacto de distribución para inferencia local en el cliente, no la de una contribución de modelado. Cualquier evaluación de capacidades debe remitirse al modelo base google/gemma-3-4b-it y a su cuantización Q4_K_M.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3, según modelo base) |
| Parametros totales | 3.880.099.328 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Gemma Terms of Use (licencia "gemma") |
| Formato de pesos | GGUF troceado en 6 partes de maximo 512 MB |

## Arquitectura y entrenamiento

Este repositorio no aporta arquitectura ni entrenamiento propios: hereda íntegramente los del modelo base google/gemma-3-4b-it, un transformer decoder-only de aproximadamente 3,88 mil millones de parámetros en su versión instructiva. La model card no documenta datos de entrenamiento, número de tokens, composición del corpus ni etapas de alineación (RLHF/DPO) para este artefacto, y no se han publicado detalles adicionales en la información disponible.

La única intervención técnica es de empaquetado: el GGUF Q4_K_M original se divide con `llama-gguf-split` en seis fragmentos de hasta 512 MB para que wllama pueda cargarlos en un navegador. No hay recuantización, poda, fusión ni modificación de pesos; la reconstrucción del archivo es bit a bit idéntica al original, como confirma el hash indicado por el autor.

## Capacidades

- Generación de texto conversacional en modo instructivo, heredada de gemma-3-4b-it.
- Razonamiento de propósito general y respuesta a instrucciones; el nivel concreto de rendimiento en matemáticas y código no está documentado en este repositorio.
- Ejecución local en el dispositivo del usuario mediante wllama, sin envío de datos a servidores externos una vez descargados los fragmentos.
- Carga incremental por partes, lo que permite operar en entornos de navegador con límites de tamaño de archivo.
- Soporte de tool calling, agentes o modo thinking: no disponible en la informacion proporcionada para este artefacto.
- Capacidades multimodales: no disponible en la informacion proporcionada (el GGUF distribuido corresponde a la variante de texto).

## Casos de uso

- Asistente de estudio integrado en AgriNexa: la aplicación descarga los seis fragmentos solo cuando el alumno activa Pluto AI y ejecuta el modelo en su propio dispositivo, de modo que las consultas formativas no salen del navegador.
- Despliegue web sin backend de inferencia: el troceado a 512 MB permite servir el modelo desde un CDN estático y cargarlo con wllama, eliminando la necesidad de infraestructura GPU propia para el chat.
- Escenarios con requisitos de privacidad: al ejecutarse en el cliente, es adecuado para material formativo o consultas que no deben registrarse en servidores de terceros.
- Prototipado rápido de asistentes conversacionales en navegador: sirve como base para validar flujos de chat, prompts de sistema y UX antes de invertir en un despliegue con vLLM o TGI.
- Distribución de material educativo en entornos con conectividad intermitente: una vez descargados los fragmentos, el modelo queda disponible localmente sin dependencia de red.
- Verificación de integridad en pipelines de distribución: el SHA-256 publicado permite comprobar que la reconstrucción de los fragmentos coincide con el GGUF oficial antes de servirlo a los usuarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio ocupa 2,5 GB en total; en Q4_K_M la inferencia requiere del orden de 3 GB de memoria disponible, aunque el autor no publica cifras oficiales.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada por el autor; el caso de uso declarado es la ejecución en navegador mediante wllama (CPU/WASM), no GPU dedicada.
- Opciones de despliegue: wllama en navegador; al ser un GGUF estándar, es compatible con llama.cpp y, previsiblemente, con Ollama y otros runners GGUF, aunque no se documenta explícitamente.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| qontack/agrinexa-pluto-gemma | 3.880.099.328 | no disponible | GGUF Q4_K_M troceado (6 x 512 MB) | Gemma Terms of Use | Redistribucion para wllama; pesos identicos al base |
| google/gemma-3-4b-it | 3.880.099.328 (misma cifra reportada) | no disponible | safetensors | Gemma Terms of Use | Modelo base instructivo original |
| ggml-org/gemma-3-4b-it-GGUF | 3.880.099.328 | no disponible | GGUF (archivo unico Q4_K_M) | Gemma Terms of Use | Fuente directa del GGUF redistribuido aqui |

## Limitaciones y advertencias

- No es un modelo nuevo ni ajustado: no aporta mejoras de calidad, dominio agrario ni alineación específica respecto a gemma-3-4b-it.
- El troceado en seis archivos añade complejidad operativa: el consumidor debe descargar todas las partes y unirlas o cargarlas en orden; un fragmento corrupto invalida el conjunto.
- La licencia Gemma Terms of Use y la Gemma Prohibited Use Policy se aplican íntegramente; el uso comercial está sujeto a dichos términos y a las obligaciones de atribución correspondientes.
- Riesgo de alucinación inherente a un modelo de 4B en cuantización Q4_K_M; no se han publicado evaluaciones específicas para este artefacto.
- Idiomas soportados no documentados en este repositorio; deben consultarse en la documentación del modelo base.
- Longitud de contexto no indicada; en ejecución en navegador, la memoria disponible del dispositivo puede limitar el contexto efectivo por debajo del máximo del modelo.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay evidencia de uso en producción ni validación comunitaria.
- Fecha de creación registrada como 2026-11-14, posterior a la fecha habitual de publicación de Gemma 3; conviene verificar la procedencia y el hash antes de desplegar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/qontack/agrinexa-pluto-gemma
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- GGUF de origen: https://huggingface.co/ggml-org/gemma-3-4b-it-GGUF
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
