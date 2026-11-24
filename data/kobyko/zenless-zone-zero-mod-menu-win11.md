# Kobyko/zenless-zone-zero-mod-menu-win11

## Resumen

El artefacto publicado bajo el identificador `Kobyko/zenless-zone-zero-mod-menu-win11` no es un modelo de inteligencia artificial ni un modelo de lenguaje. Se trata de un binario ejecutable para Windows x64 distribuido a través de un repositorio de Hugging Face, empaquetado como archivo ZIP de 8,9 MB y presentado por su autor como un "mod menu" para el videojuego *Zenless Zone Zero*. No incluye pesos, tokenizador, configuración de arquitectura ni ningún artefacto propio de un modelo de aprendizaje automático.

La model card describe funcionalidades típicas de una herramienta de trampas para videojuegos: radar 2D mediante lectura directa de memoria, filtrado de botín por rareza, escaneo dinámico de offsets tras parches del juego, capa de renderizado que evita la captura por OBS o ShadowPlay y una tecla de pánico (`END`) para descargar el proceso. El paquete se distribuye como ejecutable con contraseña de descompresión (`2026`) y requiere ejecución como administrador.

Desde la perspectiva de un catálogo de modelos open source, esta ficha no puede evaluar capacidades de generación, razonamiento ni rendimiento en benchmarks porque el artefacto no es un modelo. La información se limita a documentar lo que el repositorio declara y a advertir de los riesgos asociados a la ejecución de binarios de procedencia no verificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; binario ejecutable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (se distribuye `zenless-zone-zero-mod-menu-win11-v1.2.0-win64.zip` y `.exe`) |

## Arquitectura y entrenamiento

No aplica. El repositorio no contiene un transformer, un modelo MoE, un SSM ni ningún otro tipo de red neuronal. No hay datos de entrenamiento, corpus, proceso de RLHF/DPO ni innovaciones de inferencia que documentar.

La model card describe componentes de ingeniería de un programa de escritorio: núcleo externo en modo usuario, escaneo asíncrono de offsets, intercambio en caliente de perfiles JSON, renderizado mediante Desktop Duplication API y polling a 168 Hz y 400 Hz según el módulo. Estos datos describen el funcionamiento del ejecutable, no de un modelo.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve problemas matemáticos.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No implementa agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües en el sentido de un modelo; los códigos de idioma de los metadatos son etiquetas del repositorio.
- Según la model card, el binario declara: radar 2D, filtro de botín, perfiles JSON, escáner de offsets, tecla de pánico y capa de renderizado no capturable por software de grabación.

## Casos de uso

No se identifican casos de uso legítimos como modelo de IA, porque no lo es. Los escenarios que la model card sugiere (modificar el comportamiento de un videojuego en Windows) quedan fuera del ámbito de esta ficha y conllevan riesgos legales y de seguridad que se detallan más abajo.

- Evaluación de seguridad de artefactos: analizar el binario en un entorno aislado para estudiar técnicas de evasión de captura o manipulación de memoria.
- Investigación de malware: usar el ejecutable como muestra en un sandbox para documentar comportamiento de binarios que requieren privilegios de administrador.
- Docencia sobre riesgos de cadena de suministro: ilustrar por qué no deben ejecutarse binarios de repositorios sin verificación de procedencia.
- No se recomienda su uso en producción, en entornos corporativos ni en equipos personales con datos sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Sistema operativo: Windows 10 u 11 de 64 bits, según la model card.
- CPU: Intel o AMD x64.
- RAM: la model card menciona un uso inferior a 49 MB durante la ejecución.
- GPU: no aplica; no se requiere aceleración gráfica para un modelo de IA.
- Almacenamiento: paquete ZIP de 8,9 MB.
- Despliegue: no aplica (no hay vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no pertenece a esa categoría. Tampoco se han identificado en la información proporcionada otras herramientas de la misma naturaleza con las que establecer una comparación rigurosa.

## Limitaciones y advertencias

- No es un modelo de IA: no debe incluirse en catálogos, evaluaciones ni pipelines de modelos.
- Riesgo de seguridad elevado: se trata de un ejecutable que solicita privilegios de administrador, se distribuye con contraseña de descompresión y declara técnicas de evasión de captura de pantalla, patrones habituales en software malicioso.
- Procedencia no verificada: el repositorio de Hugging Face (`Kobyko/...`) y el enlace de descarga apuntan a cuentas distintas (`Christoph57/...`), lo que impide confirmar la autoría.
- Posible infracción de términos de servicio: las herramientas de modificación o trampa en videojuegos suelen violar las condiciones de uso del juego y pueden conllevar el bloqueo de cuentas.
- Riesgo legal: la distribución de cheats puede infringir normativa de propiedad intelectual y protección de software según la jurisdicción.
- La licencia MIT declarada en los metadatos no aporta garantías sobre el contenido real del binario.
- No se recomienda su descarga, ejecución ni distribución en ningún entorno.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Kobyko/zenless-zone-zero-mod-menu-win11
- Enlace de descarga citado en la model card (no verificado): https://github.com/Christoph57/zenless-zone-zero-mod-menu-win11/releases/latest/download/zenless-zone-zero-mod-menu-win11-v1.2.0-win64.zip
- Página de releases citada en la model card: https://github.com/Christoph57/zenless-zone-zero-mod-menu-win11/releases/latest
