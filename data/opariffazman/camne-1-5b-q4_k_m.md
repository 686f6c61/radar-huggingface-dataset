# opariffazman/camne-1.5b-Q4_K_M

## Resumen

`camne-1.5b-Q4_K_M` es un modelo de generación de texto especializado en convertir lenguaje natural en comandos de shell (nl2sh), desarrollado por opariffazman como un ajuste fino tipo LoRA sobre `Qwen/Qwen2.5-Coder-1.5B-Instruct`. El modelo está pensado para el proyecto [camne](https://github.com/officialdad/camne), una herramienta que ejecuta localmente en CPU (4 núcleos, 8 GB de RAM, sin GPU) y que permite a usuarios de habla malaya y de inglés generar comandos POSIX/bash a partir de frases coloquiales, incluyendo el registro "rojak" (mezcla de malayo e inglés técnico típico de Malasia).

El problema que resuelve es la brecha entre la traducción automática formal y el lenguaje real que escriben los usuarios: nadie teclea "Bagaimanakah cara untuk mencari fail", sino "camne nak cari file". El modelo está cuantizado en GGUF Q4_K_M, tiene 1.543.714.304 parámetros y una licencia Apache-2.0, lo que lo hace ligero y adecuado para despliegue en entornos sin GPU. Su relevancia radica en ofrecer una alternativa local, privada y eficiente para la generación de comandos en un idioma poco cubierto por los modelos comerciales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5-Coder-1.5B-Instruct) con adaptadores LoRA |
| Parametros totales | 1.543.714.304 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (hereda del modelo base, no se especifica) |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | Malayo (ms), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de `Qwen2.5-Coder-1.5B-Instruct`, un transformer denso de 1.5B parámetros, y se le aplica un ajuste fino con LoRA (r32, α64, dropout 0.05) sobre todas las capas lineales. El entrenamiento se realizó con 307.140 pares (instrucción → comando), construidos a partir de 76.785 comandos únicos multiplicados por cuatro registros lingüísticos: malayo formal, malayo coloquial, rojak (malayo con sustantivos técnicos ingleses) e inglés. Los comandos se mantuvieron byte-idénticos a sus fuentes (nunca se tradujeron) para preservar la usabilidad del benchmark; la parte malaya se tradujo localmente con `Gemma-SEA-LION-v3-9B-IT-GGUF`.

Se entrenó durante una sola época (cuatro exposiciones por comando debido a los cuatro registros), con secuencia de 512 tokens, batch efectivo de 32, precisión bf16 y optimizador AdamW con coseno y 3% de warmup. El autor reporta que dos épocas producían sobreajuste, con peores resultados en todos los registros y alucinación de rutas de archivo memorizadas. La cuantización Q4_K_M se aplicó posteriormente para reducir el tamaño a aproximadamente 1 GB y permitir su ejecución en CPU.

## Capacidades

- Generación de comandos shell (POSIX/bash) a partir de lenguaje natural en malayo, rojak e inglés.
- Soporte del formato de prompt ChatML, con un system message específico que instruye al modelo a emitir exactamente una línea de comando, sin prosa ni explicaciones.
- Manejo de registros coloquiales y mezclas de idiomas (rojak), incluyendo sustantivos técnicos ingleses no traducidos.
- Generación de comandos para tareas comunes de administración de sistemas: búsqueda de archivos, manipulación de permisos, gestión de procesos, etc.
- Compatible con decodificación con gramática GBNF de una sola línea (según la configuración del benchmark).
- Capacidad de ejecución local en CPU sin conexión a internet (privacidad de datos).

## Casos de uso

- Asistente de terminal para usuarios de habla malaya: un usuario escribe "camne nak cari file lagi besar dari 100MB kat folder ni" y el modelo genera `find . -size +100M`, permitiendo a personas sin experiencia en línea de comandos ejecutar tareas de gestión de archivos.
- Automatización de tareas de administración en entornos con restricciones de privacidad: al ejecutarse localmente, el modelo no envía datos a servidores externos, adecuado para empresas que manejan información sensible.
- Integración en herramientas de productividad tipo "copiloto de terminal": el modelo puede conectarse a editores de código o shells interactivos para sugerir comandos en tiempo real, mejorando la eficiencia de desarrolladores que prefieren lenguaje natural.
- Generación de scripts de mantenimiento para sistemas Linux en organizaciones con equipos multilingües: el modelo acepta instrucciones en inglés o malayo, facilitando la colaboración entre equipos.
- Educación y formación en línea de comandos: estudiantes pueden practicar shell escribiendo peticiones en su idioma materno y recibir el comando equivalente, con la opción de revisar la sintaxis.
- Asistentes de voz o chat para dispositivos embebidos: gracias a su tamaño reducido y cuantización, el modelo puede desplegarse en hardware limitado (Raspberry Pi, routers) para interpretar órdenes habladas o escritas y ejecutar acciones del sistema.

## Benchmarks y rendimiento

El autor evaluó el modelo con el benchmark [InterCode-ALFA](https://github.com/westenfelder/InterCode-ALFA), usando el scorer sin modificar, 300 tareas por conjunto, temperatura 0, `n_predict` 64, umbral de embedding 0.75, `repeat_penalty` 1.08, gramática GBNF de una sola línea y semilla 42. Los resultados se comparan con `nl2sh-1.5b`, un ajuste del mismo modelo base pero orientado solo a inglés.

| Modelo | BM (malayo) | Rojak | EN (inglés) | Media |
|---|---|---|---|---|
| nl2sh-1.5b (ajuste inglés) | 0.297 | 0.430 | **0.593** | 0.440 |
| **camne-1.5b** | **0.417** | **0.490** | 0.533 | **0.480** |

Prueba exacta de McNemar pareada contra nl2sh-1.5b:

| Registro | Cambio | p |
|---|---|---|
| BM | +0.120 | 0.0002 |
| Rojak | +0.060 | 0.044 |
| EN | −0.060 | 0.050 |

El autor advierte que la diferencia en inglés (−0.060) no es estadísticamente significativa con 300 tareas, por lo que la afirmación correcta es "no se puede distinguir", no "es igual de bueno". Para entradas en inglés puro, el modelo nl2sh-1.5b sigue siendo preferible.

## Requisitos de hardware

- Inferencia en CPU: el modelo está diseñado para ejecutarse en CPU con 4 núcleos y 8 GB de RAM, sin GPU (según la descripción del proyecto camne).
- Tamaño del archivo: aproximadamente 1 GB (repo de 1.0 GB), por lo que cabe en sistemas embebidos y portátiles modestos.
- VRAM: no requiere GPU, pero si se usa una, cualquier GPU con al menos 2 GB de VRAM puede cargar el modelo en memoria (aunque no es necesario).
- Opciones de despliegue: compatible con llama.cpp, Ollama y cualquier runtime que soporte GGUF. También se puede servir con vLLM si se convierte a safetensors, aunque no es el formato original.
- Latencia estimada: no disponible en la información proporcionada; depende del hardware y del número de tokens generados (normalmente 1-2 comandos cortos).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización | Rendimiento medio (InterCode-ALFA) |
|---|---|---|---|---|---|
| **camne-1.5b** | 1.54B | No disponible | Apache-2.0 | nl2sh multilingüe (ms, rojak, en) | 0.480 |
| nl2sh-1.5b | 1.54B | No disponible | Apache-2.0 | nl2sh solo inglés | 0.440 |
| Qwen2.5-Coder-1.5B-Instruct (base) | 1.54B | 32k (según documentación oficial del base, no en la info del modelo) | Apache-2.0 | Generación de código y comandos en inglés | No evaluado en este benchmark |

La comparativa se limita a modelos del mismo tamaño y base. El modelo base no está evaluado en InterCode-ALFA, por lo que no se dispone de datos comparativos directos. En los tres registros, camne-1.5b supera a nl2sh-1.5b en malayo y rojak, pero es ligeramente inferior en inglés (diferencia no significativa).

## Limitaciones y advertencias

- Tamaño reducido (1.5B parámetros): fiable para tareas comunes y herramientas estándar, pero poco fiable en pipelines largos, comandos con flags poco frecuentes o construcciones complejas.
- Posible generación de placeholders (p. ej., `path/to/file`) y, para herramientas interactivas, secuencias de teclas (p. ej., `<Ctrl x>`). El proyecto camne los señala o imprime tal cual, pero otros usos deben gestionarlo.
- El modelo genera comandos, pero no evalúa si ejecutarlos es seguro. No debe integrarse en sistemas que ejecuten comandos automáticamente sin una capa de validación adicional.
- Sesgo lingüístico: el registro rojak está orientado al malayo de Malasia; puede no funcionar bien con otras variantes del malayo o con mezclas con otros idiomas.
- Sin datos sobre comportamiento en contextos largos: la longitud de contexto no está especificada y el entrenamiento usó secuencias de 512 tokens, por lo que no se recomienda usarlo con instrucciones muy extensas.
- La cuantización Q4_K_M puede degradar ligeramente la precisión frente al modelo en bf16, aunque el autor no reporta diferencias específicas.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen2.5-Coder-1.5B-Instruct también es Apache-2.0, sin restricciones adicionales conocidas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/opariffazman/camne-1.5b-Q4_K_M
- Proyecto camne: https://github.com/officialdad/camne
- Modelo base Qwen2.5-Coder-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Benchmark InterCode-ALFA: https://github.com/westenfelder/InterCode-ALFA
- Dataset NL2SH-ALFA: https://huggingface.co/datasets/westenfelder/NL2SH-ALFA
- Dataset cli-commands-explained: https://huggingface.co/datasets/b-mc2/cli-commands-explained
- Dataset git-instruction-dataset: https://huggingface.co/datasets/0xrushi/git-instruction-dataset
- Traductor usado para el dataset: https://huggingface.co/aisingapore/Gemma-SEA-LION-v3-9B-IT-GGUF
- Modelo comparado nl2sh-1.5b: https://huggingface.co/ThorOdinson246/nl2sh-1.5b-Q4_K_M
