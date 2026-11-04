# Convergent-ch/Alpina-Endas-2.2-AoM-5B-Small-GGUF

## Resumen

Alpina Endas-2.2-AoM-5B-Small es un modelo publicado por Convergent-ch bajo una arquitectura propietaria denominada AoM (Assembly of Models, según la nomenclatura del autor), con un total declarado de 5,29 mil millones de parámetros. No se trata de un transformer monolítico convencional: la model card describe un sistema compuesto por un "Input-Divisor" y múltiples "especialistas" que se invocan de forma orquestada. El repositorio aquí descrito es la variante GGUF distribuida como companion de la página principal del modelo.

La relevancia del modelo es más experimental que de producción. El propio autor reconoce en la documentación que la variante Small "a menudo da respuestas incorrectas o irrelevantes", y que las comprobaciones realizadas verifican la ejecución del runtime, no la calidad de las respuestas. El interés técnico reside en el enfoque de orquestación multi-modelo empaquetado como extensión del CLI de Ollama en Windows x64, no en el rendimiento bruto del modelo.

La información pública disponible es escasa: no hay detalles sobre datos de entrenamiento, composición del dataset, benchmarks ni arquitectura interna de los especialistas. Esta ficha refleja exclusivamente lo declarado por el autor y marca como "no disponible" todo aquello que no aparece en la documentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | AoM (Assembly of Models): Input-Divisor + especialistas orquestados; no se detalla la arquitectura interna de cada miembro |
| Parametros totales | 5,29B (total AoM declarado) |
| Parametros activos | no disponible (no es un MoE clásico; el autor no publica el reparto por especialista) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (no se detallan los niveles de cuantización disponibles) |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (alojados en un repositorio de dataset enlazado) |

## Arquitectura y entrenamiento

La arquitectura AoM se describe como un sistema compuesto: un componente "Input-Divisor" recibe la entrada y la distribuye entre varios especialistas. Según la model card, la variante Medium utiliza los contextos de cinco miembros (seis llamadas en total), mientras que la variante Small utiliza 169 contextos (170 llamadas), con caché de siete conjuntos de pesos aprendidos porque las copias dentro de una misma familia son idénticas. Este dato sugiere una estructura de especialistas agrupados por familia con pesos compartidos, aunque el autor no detalla la topología exacta ni el mecanismo de enrutamiento.

No se publica información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas como decodificación especulativa o atención lineal. El autor tampoco documenta cómo se entrenaron los especialistas ni qué relación guardan entre sí más allá de la compartición de pesos dentro de cada familia.

## Capacidades

- Generación de texto conversacional en inglés mediante el comando `ollama run alpina-endas-2.2-aom-5b-small`.
- Orquestación multi-especialista: el Input-Divisor enruta la consulta a los especialistas correspondientes.
- Ejecución vía extensión del CLI de Ollama en Windows x64, con importación automática de pesos y verificación de hashes.
- Soporte de dos configuraciones declaradas: Medium (5 miembros, 6 llamadas) y Small (169 contextos, 170 llamadas).
- Caché de conjuntos de pesos compartidos entre especialistas de la misma familia para reducir llamadas redundantes.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Evaluación de arquitecturas de orquestación multi-modelo: el sistema permite experimentar con enrutamiento Input-Divisor y especialistas agrupados por familia, útil para investigación sobre composición de modelos.
- Pruebas de integración con Ollama en Windows: el instalador automatiza descarga, verificación de hashes e importación, lo que sirve para validar pipelines de despliegue local en entornos Windows x64.
- Docencia y demostraciones de sistemas compuestos: la separación entre planner, Input-Divisor y especialistas facilita explicar conceptos de ensamblado de modelos en un aula o laboratorio.
- Benchmarking de runtimes: permite medir latencia y comportamiento de 170 llamadas encadenadas frente a 6, útil para estudiar el coste de la orquestación multi-especialista.
- Investigación sobre compartición de pesos: la caché de siete conjuntos de pesos para 169 contextos es un caso concreto para estudiar reutilización de parámetros en sistemas compuestos.
- Prototipado interno no crítico: dado que el autor advierte de respuestas incorrectas frecuentes en la variante Small, solo resulta adecuado para entornos de prueba donde la calidad de respuesta no sea un requisito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio GGUF ocupa 6,2 GB, lo que da una cota inferior del espacio en disco necesario para los pesos.
- GPU recomendadas: no especificadas por el autor.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del repo (6,2 GB) sugiere que podría caber en GPUs con 8 GB o más de VRAM en cuantizaciones bajas, pero no hay confirmación oficial.
- Despliegue: extensión del CLI de Ollama para Windows x64 (instalador `Ollama-AoM-Setup-Windows-x64.exe`); requiere Ollama oficial previamente instalado. No se documenta soporte para vLLM, llama.cpp directo ni TGI.
- Latencia y throughput: no disponibles; la variante Small ejecuta 170 llamadas por consulta, lo que implica un coste de orquestación significativamente mayor que un modelo monolítico equivalente.

## Comparativa con modelos similares

No disponible. El autor no publica comparaciones con otros modelos, y la naturaleza compuesta del sistema (5,29B totales distribuidos en especialistas) no encaja directamente con categorías estándar de transformers monolíticos del mismo orden de parámetros.

## Limitaciones y advertencias

- El autor advierte explícitamente de que la variante Small "a menudo da respuestas incorrectas o irrelevantes"; las verificaciones realizadas validan la ejecución, no la calidad.
- Solo soporta inglés (`language: en`); no hay evidencia de capacidades multilingües.
- No se publican detalles sobre sesgos, datos de entrenamiento ni evaluación de alucinaciones.
- El instalador de Windows es una compilación no firmada del proyecto; el autor incluye código fuente y checksums SHA-256, pero no procede de Ollama upstream.
- La extensión modifica el CLI de Ollama pero no el formato GGUF ni la GUI/API estándar; una descarga GGUF aislada no instala la extensión.
- El coste de orquestación es elevado: 170 llamadas por consulta en la variante Small, con caché de siete conjuntos de pesos.
- Aunque la licencia es Apache 2.0, la documentación no aclara si los pesos de los especialistas individuales están cubiertos por la misma licencia ni si existen restricciones adicionales sobre los componentes descargados desde el repositorio de dataset.
- No hay información sobre el contexto máximo soportado, lo que impide planificar su uso en tareas de contexto largo.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/Convergent-ch/Alpina-Endas-2.2-AoM-5B-Small-GGUF
- Página principal del modelo (parámetros totales): https://huggingface.co/Convergent-ch/Alpina-Endas-2.2-AoM-5B-Small
- Pesos GGUF (repositorio de dataset): https://huggingface.co/datasets/Convergent-ch/Alpina-Endas-2.2-AoM-5B-Small-GGUF/tree/main
- Instalador Windows x64: https://huggingface.co/Convergent-ch/Alpina-Endas-2.2-AoM-5B-Small-GGUF/resolve/main/runtime/Ollama-AoM-Setup-Windows-x64.exe?download=true
- ZIP con setup, fuente y checksums: https://huggingface.co/Convergent-ch/Alpina-Endas-2.2-AoM-5B-Small-GGUF/resolve/main/runtime/Alpina-Ollama-AoM-Windows-x64.zip?download=true
