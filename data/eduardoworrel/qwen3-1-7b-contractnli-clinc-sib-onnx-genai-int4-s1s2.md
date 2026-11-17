# eduardoworrel/Qwen3-1.7B-ContractNLI-CLINC-SIB-ONNX-genai-int4-S1S2

## Resumen

Qwen3-1.7B-ContractNLI-CLINC-SIB-ONNX-genai-int4-S1S2 es un modelo especialista multi-tarea derivado de Qwen3-1.7B, publicado por el usuario eduardoworrel. No es un modelo generativo de propósito general: es un clasificador con tres cabezas independientes montadas sobre el transformer base, una para ContractNLI (determinar si un NDA implica, contradice o no menciona una hipótesis), otra para CLINC150 (decidir si una consulta está dentro o fuera de dominio) y una tercera para la clasificación temática de SIB-200 en inglés y portugués. Cada tarea se resuelve en un único forward pass, devolviendo una opción tipada, una probabilidad y un margen de decisión.

El interés técnico reside en su empaquetado y en el patrón de inferencia que propone. Los pesos están exportados como grafo ONNX int4 para onnxruntime-genai con soporte WebGPU, lo que permite ejecutar el modelo íntegramente en el navegador con una descarga de 0,98 GB. Sobre esa base, el autor implementa un esquema System 1 / System 2: la cabeza clasificadora responde en una sola pasada y, solo cuando el margen cae por debajo de un umbral calibrado, se escala a una generación completa con el modelo base para justificar la decisión.

El modelo es relevante como ejemplo de despliegue de clasificadores especializados de bajo coste sobre LLM pequeños cuantizados, con aplicaciones directas en filtrado de consultas, revisión contractual asistida y etiquetado temático multilingüe. Su licencia CC BY-SA 4.0, heredada de SIB-200, condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con cabezas de clasificación por tarea (pointer/choice head) |
| Parametros totales | 1,7 mil millones (modelo base Qwen3-1.7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens para ContractNLI; no disponible para el resto de tareas |
| Tipos de cuantizacion | int4 (grafo ONNX) |
| Idiomas soportados | inglés (en), portugués (pt) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | ONNX (onnxruntime-genai), grafo int4 para WebGPU; adaptador LoRA y cabezas en PyTorch en repo separado |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer decoder-only de 1,7 mil millones de parámetros, y le añade cabezas de decisión específicas por tarea entrenadas mediante un adaptador LoRA (publicado en el repo eduardoworrel/Qwen3-1.7B-ContractNLI-CLINC-SIB-LoRA). La receta de la cabeza pointer y el procedimiento de entrenamiento siguen el proyecto Kev (Apache-2.0). Cada cabeza lee el prompt con un conjunto cerrado y exacto de palabras de opción (por ejemplo, "Entailment", "Contradiction", "Not mentioned" para ContractNLI) y emite una distribución sobre esas opciones en una única pasada, sin generación autorregresiva.

El entrenamiento combina tres conjuntos de datos públicos: ContractNLI (Koreeda y Manning, 2021; CC BY 4.0), CLINC150 (Larson et al., 2019; CC BY 3.0) y SIB-200 (Adelani et al., 2024; CC BY-SA 4.0), este último para clasificación temática en inglés y portugués. No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO; el ajuste es supervisado sobre las cabezas. La innovación destacable es el esquema S1S2: decisión tipada en un forward pass (System 1) con escalado condicionado por margen a generación completa (System 2), más una cabeza de evidencia (heads/evidence_cnli/) que localiza los extremos del span relevante dentro del contrato, aunque la versión 0.1 de s1s2 todavía no la explota.

## Capacidades

- Clasificación de relación contractual (ContractNLI): decide si un fragmento de NDA implica, contradice o no menciona una hipótesis dada, devolviendo opción, probabilidad y margen.
- Detección de consultas fuera de dominio (CLINC150): clasificación binaria dentro/fuera de alcance para enrutado de consultas.
- Clasificación temática multilingüe (SIB-200): siete categorías (ciencia/tecnología, viaje, política, deportes, salud, entretenimiento, geografía) en inglés y portugués.
- Decisión en un único forward pass con salida tipada (System 1), sin generación de texto.
- Escalado a generación (System 2) con umbral de margen calibrable sobre datos propios etiquetados, manteniendo la respuesta tipada original.
- Generación de texto breve para justificar decisiones (por ejemplo, explicación en una frase con maxNewTokens=64).
- Ejecución en navegador mediante WebGPU a través de la librería s1s2.
- Localización de evidencia en el contrato mediante la cabeza auxiliar de spans (no integrada aún en s1s2 0.1).
- No soporta tool calling, function calling ni razonamiento multi-paso general; sus capacidades están acotadas a las tres tareas entrenadas.

## Casos de uso

- Triaje de consultas en atención al cliente: la cabeza CLINC150 clasifica en una sola pasada si una consulta entrante está dentro del dominio cubierto por el bot; las consultas fuera de alcance se derivan a un agente humano, reduciendo coste frente a invocar un LLM generativo por cada mensaje.
- Revisión asistida de NDAs: la cabeza ContractNLI evalúa hipótesis concretas ("la parte receptora debe destruir la información confidencial al terminar el acuerdo") sobre contratos de hasta 2.048 tokens y devuelve entailment, contradicción o no mención con probabilidad y margen, útil como primera pasada en herramientas de legal tech.
- Filtrado previo en pipelines RAG: clasificar la consulta del usuario antes de recuperar documentos evita búsquedas innecesarias cuando la pregunta queda fuera del corpus cubierto, con latencia de un forward pass.
- Etiquetado temático de noticias y contenidos en inglés y portugués: la cabeza SIB-200 asigna una de siete categorías por documento, adecuada para enrutado editorial o construcción de datasets anotados a bajo coste.
- Ejecución en el navegador para privacidad de datos: al correr con WebGPU y onnxruntime-genai, el texto del contrato o de la consulta no abandona el dispositivo del usuario, lo que facilita el cumplimiento en entornos con requisitos estrictos de residencia de datos.
- Enrutado con escalado selectivo: en producción, las decisiones con margen alto se aceptan directamente (System 1) y solo el 15 % de menor margen se escala a generación con el modelo base, equilibrando coste y precisión con un umbral calibrado sobre datos de desarrollo propios.
- Clasificación de intenciones en asistentes de voz o chat embebidos: el grafo int4 de 0,98 GB cabe en dispositivos con WebGPU y permite clasificación local sin backend.

## Benchmarks y rendimiento

Resultados medidos por el autor sobre el grafo int4 con ONNX Runtime CPU (x86) en los splits de test oficiales, usando balanced accuracy de la cabeza de cada tarea:

| Test set | Balanced accuracy (%) | Azar (%) | n |
|---|---|---|---|
| CLINC150 out-of-scope | 88,2 | 50 | 2.000 |
| ContractNLI | 67,5 | 33,3 | 1.190 |
| SIB-200 inglés | 88,1 | 14,3 | 204 |
| SIB-200 portugués | 84,8 | 14,3 | 204 |

En navegador (Chrome, WebGPU, Apple M2 Pro) sobre el split de desarrollo: CLINC150 91,6 y ContractNLI 64,2. El autor indica que la prueba en navegador sobre test no se ha realizado todavía.

## Requisitos de hardware

- Descarga del grafo int4: 0,98 GB; tamaño del repositorio completo: 1,0 GB.
- Inferencia en CPU x86 mediante ONNX Runtime sin GPU dedicada (configuración usada para los benchmarks publicados).
- Ejecución en navegador con WebGPU; probado en Chrome sobre Apple M2 Pro (GPU integrada).
- VRAM estimada: no disponible de forma explícita; por el tamaño del grafo int4 (0,98 GB) más buffers de activación, cabe holgadamente en GPUs de consumo con 4-8 GB, aunque el autor no publica cifras.
- GPUs recomendadas: no disponible; el diseño apunta a WebGPU y CPU, no a aceleradores de datacenter.
- Opciones de despliegue: onnxruntime-genai (formato nativo del repo), librería s1s2 (npm, github.com/eduardoworrel/s1s2) para navegador; el adaptador LoRA en PyTorch está en repo separado, pero no se documenta un camino de despliegue con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; solo se reporta que cada decisión System 1 requiere un único forward pass.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| Este modelo (Qwen3-1.7B + cabezas) | 1,7 B | 2.048 (ContractNLI) | Clasificación multi-tarea (ContractNLI, CLINC150, SIB-200) | CC BY-SA 4.0 | ONNX int4 |
| Qwen/Qwen3-1.7B (base) | 1,7 B | no disponible en la información | Generación general | Apache-2.0 | safetensors |
| eduardoworrel/Qwen3-1.7B-ContractNLI-CLINC-SIB-LoRA | 1,7 B | no disponible | Mismas tareas con adaptador y cabezas | no disponible en la información | PyTorch (LoRA) |
| aliasrobotics/alias3-web (precursor citado) | no disponible | no disponible | Clasificación en navegador (Browser Immune System) | no disponible | no disponible |

No se dispone de datos de benchmarks de los modelos alternativos en la información proporcionada para establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- ContractNLI solo procesa NDAs de hasta 2.048 tokens; contratos más largos requieren truncado o segmentación.
- CLINC150 se reformula como clasificación binaria dentro/fuera de alcance, no como clasificación de las 150 intenciones originales.
- Las etiquetas de SIB-200 en portugués se proyectan desde el inglés, lo que puede introducir sesgo de traducción en esa lengua.
- Las cabezas solo funcionan con las palabras de opción exactas del entrenamiento; cualquier variación en el prompt cambia la entrada que lee la cabeza y rompe la predicción.
- El umbral de escalado a System 2 debe calibrarse sobre datos propios etiquetados; el valor por defecto no está validado para dominios distintos.
- La cabeza de evidencia (heads/evidence_cnli/) no está integrada en s1s2 0.1, por lo que la localización de spans no está disponible en el flujo estándar.
- La prueba en navegador solo se ha hecho sobre el split de desarrollo, no sobre test; el rendimiento real en WebGPU puede diferir del reportado en CPU.
- Licencia CC BY-SA 4.0 con cláusula ShareAlike: obliga a compartir bajo la misma licencia las obras derivadas, lo que puede ser incompatible con productos propietarios; requiere mantener la atribución a ContractNLI, CLINC150, SIB-200 y al modelo base.
- No se documentan evaluaciones de sesgo, robustez adversarial ni tasas de alucinación en la generación de justificaciones (System 2).
- El modelo no es un generador de propósito general; usarlo fuera de las tres tareas entrenadas no está validado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eduardoworrel/Qwen3-1.7B-ContractNLI-CLINC-SIB-ONNX-genai-int4-S1S2
- Adaptador LoRA y cabezas en PyTorch: https://huggingface.co/eduardoworrel/Qwen3-1.7B-ContractNLI-CLINC-SIB-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Librería s1s2: https://github.com/eduardoworrel/s1s2
- Dataset ContractNLI: https://stanfordnlp.github.io/contract-nli/
- Dataset CLINC150: https://github.com/clinc/oos-eval
- Dataset SIB-200: https://huggingface.co/datasets/Davlan/sib200
- Receta de la cabeza pointer (Kev): https://github.com/jaredpalmer/kev
- Precursor alias3-web: https://huggingface.co/aliasrobotics/alias3-web
- Paper Browser Immune System: https://arxiv.org/abs/2611.15302
