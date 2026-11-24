# aryzik/bybit-binance-perp-copytrade-bot-download

## Resumen

La ficha solicitada corresponde a `aryzik/bybit-binance-perp-copytrade-bot-download`, un repositorio alojado en Hugging Face que **no contiene un modelo de inteligencia artificial**. Se trata de una página de distribución de un supuesto ejecutable para Windows (`fisch-script-auto-catch-macro-2026-v1.2.2-win64.exe`, empaquetado en un ZIP de 4,8 MB) presentado como bot de copytrading de perpetuos para Bybit y Binance. No hay pesos, tokenizador, configuración de arquitectura ni pipeline asociado en la información disponible.

El contenido de la model card es marcadamente incoherente: el nombre del binario hace referencia a un macro de auto-captura del videojuego *Fisch*, mientras que el título y los textos hablan de trading de criptomonedas. Además, el repositorio tiene 0 descargas y 0 likes, fue creado y actualizado en el mismo segundo (24 de noviembre de 2026) y distribuye el binario mediante enlaces a repositorios de GitHub de terceros con contraseña de extracción. Todos estos indicios son compatibles con una página señuelo o un intento de distribución de software potencialmente malicioso.

Por tanto, esta ficha documenta el artefacto tal como aparece publicado, señalando explícitamente la ausencia de cualquier componente de IA y los riesgos de seguridad asociados. No debe tratarse como un modelo evaluable ni ejecutarse en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; artefacto ejecutable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio; no verificable en un modelo inexistente) |
| Licencia | MIT (declarada en los metadatos del repositorio) |
| Formato de pesos | no disponible (el artefacto distribuido es un `.zip` con un `.exe`; no hay safetensors, GGUF ni ningún formato de pesos) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal, corpus de entrenamiento, proceso de ajuste (RLHF, DPO, SFT) ni innovación técnica alguna documentada. El repositorio no incluye tarjetas de modelo técnicas, informes de entrenamiento, configuraciones de `transformers` ni ficheros de pesos. El contenido publicado se limita a texto promocional con insignias estáticas, instrucciones de instalación de un ejecutable y enlaces a descargas alojadas en GitHub.

El binario descrito (`fisch-script-auto-catch-macro-2026-v1.2.2-win64.exe`, build `v3.2.5` / `EEB054`) se presenta como una aplicación nativa para Windows 10/11 de 64 bits, con supuestos módulos de filtrado de honeypots, motor de bundles MEV/Jito, sandbox de paper trading, almacén de claves AES-256 local, take profit multinivel y enrutamiento de órdenes por WebSocket/gRPC. Ninguna de estas afirmaciones es verificable desde la información disponible y su naturaleza (ejecutable cerrado con contraseña de extracción) impide auditoría.

## Capacidades

- No se documenta ninguna capacidad de generación de texto, razonamiento, código, matemáticas ni visión.
- No hay soporte declarado de tool calling ni function calling en el sentido de un modelo de lenguaje.
- No hay capacidades de agente ni razonamiento multi-paso basadas en un LLM.
- El artefacto se presenta como bot de trading con módulos de ejecución de órdenes, pero dichas funciones no son verificables ni auditables.
- El listado multilingüe de idiomas en los metadatos no corresponde a capacidades lingüísticas de un modelo, sino a etiquetas del repositorio.

## Casos de uso

- **Ninguno recomendado.** No es un modelo de IA y no debe emplearse como componente de software en pipelines de datos, generación de código, atención al cliente ni análisis.
- **Evaluación de seguridad defensiva:** el artefacto puede estudiarse en un entorno aislado (máquina virtual sin red, sin credenciales) como ejemplo de página señuelo en plataformas de modelos, para formar a equipos de seguridad.
- **Concienciación sobre cadena de suministro:** sirve como caso ilustrativo de repositorios que mezclan nombres de proyectos no relacionados (macro de un videojuego y bot de trading) para atraer descargas.
- **Análisis de metadatos de Hugging Face:** útil para estudiar patrones de repositorios con 0 descargas, fechas de creación y actualización idénticas y enlaces externos con contraseña.
- **Documentación de incidentes:** puede citarse en informes internos sobre riesgos de descargar ejecutables desde páginas de modelos.
- **Formación en higiene operativa:** ejemplo de por qué no se deben ejecutar binarios "como administrador" a partir de instrucciones de una model card no verificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni de ningún otro tipo, y al no existir un modelo subyacente no procede comparación alguna.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay modelo que cargar en memoria de GPU).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Requisitos del artefacto declarado: Windows 10/11 de 64 bits, y según la model card, menos de 44 MB de RAM en uno de sus módulos.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica; el artefacto se distribuye como ejecutable `.exe` dentro de un `.zip`.
- Latencia y throughput: no disponibles ni verificables; las cifras citadas en la model card (menos de 31 ms, menos de 5 ms, menos de 40 ms) no están respaldadas por ninguna medición publicada.

## Comparativa con modelos similares

No disponible. No existe categoría de modelos comparable porque el repositorio no contiene un modelo de IA. Frente a modelos de lenguaje reales (por ejemplo, familias de 7B a 70B con licencias Apache 2.0 o Llama), la comparación es inaplicable: no hay parámetros, contexto, benchmarks ni pesos.

## Limitaciones y advertencias

- **No es un modelo de IA:** no contiene pesos, tokenizador, arquitectura ni pipeline; cualquier expectativa de uso como LLM es infundada.
- **Incoherencia de identidad:** el binario hace referencia a un macro del juego *Fisch* mientras el título menciona copytrading de perpetuos en Bybit y Binance.
- **Distribución opaca:** el ejecutable se descarga desde repositorios de GitHub de terceros (`YokoCastro3813`, `HannahTakeda47`) y requiere contraseña de extracción (`2026`), lo que dificulta la auditoría y es un patrón habitual en campañas de malware.
- **Riesgo de seguridad elevado:** ejecutar binarios desconocidos como administrador puede comprometer credenciales, claves de API de exchanges y fondos.
- **Riesgo financiero:** un bot de trading no auditado puede provocar pérdidas; las afirmaciones de rendimiento (99,4 % de consistencia, latencias sub-40 ms) no están verificadas.
- **Metadatos sospechosos:** 0 descargas, 0 likes y creación y actualización en el mismo instante sugieren automatización o publicación señuelo.
- **Licencia MIT declarada:** aunque permisiva, no otorga ninguna garantía sobre el contenido ni exime de responsabilidad al usuario que ejecute el artefacto.
- **Idiomas:** el listado de 14 idiomas son etiquetas del repositorio, no capacidades lingüísticas demostradas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/aryzik/bybit-binance-perp-copytrade-bot-download
- Enlace de descarga citado en la model card (GitHub, terceros): https://github.com/YokoCastro3813/fisch-script-auto-catch-macro-2026/releases/download/v1.2.0/fisch-script-auto-catch-macro-2026-v1.2.2-win64.zip
- Repositorio de GitHub citado para la clave de extracción: https://github.com/HannahTakeda47/bybit-binance-perp-copytrade-bot-download/releases/latest
- Paper, blog o demo oficial: no disponible
