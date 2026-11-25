# LouieSaintST1/krypolybot-polymarket-mcp-whale-trader

## Resumen

El repositorio `LouieSaintST1/krypolybot-polymarket-mcp-whale-trader` no contiene un modelo de inteligencia artificial. Se trata de un paquete ejecutable para Windows x64 (comprimido en un ZIP de 4,8 MB) que se presenta como una herramienta de trading automatizado sobre Polymarket, con módulos de copia de carteras de ballenas, simulación de paper trading y gestión de claves locales. No hay pesos, arquitectura neuronal, tokenizador ni pipeline de inferencia asociados.

La model card es, de hecho, un artefacto de distribución de software: describe la instalación de un `.exe` protegido con contraseña, enlaza a un repositorio de GitHub de terceros y emplea nombres de fichero que no guardan relación con el producto anunciado (referencias a un supuesto *trainer* de un videojuego). Los metadatos de Hugging Face no declaran `pipeline`, no hay descargas ni *likes*, y el repositorio se creó y actualizó en el mismo segundo (25 de noviembre de 2026).

Por tanto, esta ficha documenta un artefacto no-modelo alojado en el Hub. Es relevante para desarrolladores e investigadores como caso de estudio de *supply chain risk*: un paquete de 4,8 MB distribuido vía Hugging Face con ejecutable firmado como "administrador", contraseña fija y enlaces a binarios externos es un vector clásico de malware o de fraude financiero, no una herramienta de IA evaluable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; es un ejecutable Windows x64) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (etiquetas de la model card; sin validación funcional) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible; el artefacto es un ZIP con un `.exe` (`kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.exe`) |
| Tamano del paquete | 4,8 MB |
| Plataforma | Windows 10 / Windows 11, 64 bits |
| Version declarada | v2.8.7 (build 152E65) |
| Contrasena del archivo | 2026 (fija, publicada en la propia model card) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El artefacto es un binario Windows empaquetado en ZIP, presentado con una tabla de "subsistemas" que mezcla terminología de trading (motor de bundles Jito/MEV, copia de ballenas, *paper trading*, *bundler* de 20 carteras con Lookup Tables, *vault* AES-256, *take profit* multinivel) con métricas sin sentido técnico verificable (respuesta en "< 26 ms", sondeo a "463 Hz", "12 hilos de trabajo", "7 hilos de trabajo").

El nombre del ejecutable y del ZIP remite a un supuesto *trainer* de un videojuego, lo que sugiere una plantilla de distribución reutilizada o un señuelo. No hay información sobre datasets, RLHF/DPO, tokenizadores ni innovaciones de inferencia porque no hay modelo. Cualquier afirmación de rendimiento de la model card debe considerarse no verificada y, dado el contexto, sospechosa.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta *tool calling* ni *function calling* en el sentido de un LLM; el "MCP" del nombre alude, presuntamente, a un servidor Model Context Protocol, pero no se documenta su implementación ni su esquema.
- No hay soporte de agentes ni de razonamiento multi-paso verificable.
- El multilingüismo es solo una lista de etiquetas en la model card; no hay evidencia de localización funcional.
- Funcionalidad declarada (no verificada): copia de operaciones de carteras de Polymarket, simulación de estrategias, gestión local de claves, ejecución multi-cartera en el mismo bloque.

## Casos de uso

- Auditoría de seguridad de la cadena de suministro: analizar el binario en un entorno aislado para identificar comportamiento malicioso, exfiltración de claves o conexiones a dominios sospechosos, dado que se distribuye un `.exe` con contraseña fija y enlaces a un repositorio de GitHub ajeno al autor del Hub.
- Formación en detección de fraudes: usar la model card como ejemplo de ingeniería social (badges falsos de "781K+ descargas" y "5.0/5", nombres de fichero incongruentes, urgencia por "Run as Administrator") en cursos de seguridad.
- Estudio de reputación en el Hub: documentar cómo un repositorio con 0 descargas y 0 *likes* puede publicarse con etiquetas de modelo y licencia MIT, y qué señales permiten descartarlo automáticamente en un pipeline de curación de datasets.
- Verificación de políticas de MCP: si el paquete afirma implementar un servidor Model Context Protocol, revisar su contrato de herramientas antes de conectarlo a un agente, ya que un servidor MCP malicioso puede ejecutar acciones en nombre del usuario.
- Análisis de riesgo en trading automatizado: evaluar por qué no debe ejecutarse software de terceros que gestiona claves privadas y órdenes de mercado sin auditoría de código ni firma reproducible.
- Docencia sobre licencias: contrastar la licencia MIT declarada con la ausencia de código fuente y de aviso de copyright, ilustrando por qué MIT sobre un binario opaco no aporta garantías.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card ("< 26 ms", "463 Hz", "12 hilos") no son benchmarks de modelo y no son verificables.

## Requisitos de hardware

- VRAM: no aplica; no hay inferencia neuronal.
- GPU: no aplica.
- CPU/SO: Windows 10 o Windows 11 de 64 bits; el paquete ocupa 4,8 MB y la model card afirma "cero dependencias externas" (no verificado).
- Despliegue: no aplica vLLM, llama.cpp, Ollama ni TGI; el artefacto se ejecuta como `.exe` nativo.
- Latencia y throughput: no disponibles; cualquier cifra de la model card carece de metodología.
- Recomendación operativa: si se inspecciona, hacerlo en una máquina virtual sin red o con red monitorizada, sin credenciales reales y sin cartera conectada.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el artefacto no es un modelo. Como referencia de categoría, se contrasta con artefactos legítimos del Hub:

| Criterio | krypolybot-polymarket-mcp-whale-trader | Modelo open source típico (p. ej. Llama, Qwen, Mistral) |
|---|---|---|
| Tipo de artefacto | Ejecutable Windows en ZIP | Pesos en safetensors/GGUF |
| Pesos / parámetros | No | Sí, declarados |
| Pipeline en el Hub | No declarado | `text-generation`, `image-text-to-text`, etc. |
| Código fuente | No incluido | Repositorio y a menudo paper |
| Benchmarks | Ninguno verificable | MMLU, HumanEval, GSM8K, etc. |
| Trazabilidad del autor | Baja (enlaces a repos de terceros) | Media-alta |
| Señales de confianza | 0 descargas, 0 likes, contraseña fija | Descargas, likes, discusión comunitaria |

## Limitaciones y advertencias

- No es un modelo de IA: no debe incluirse en catálogos de modelos ni evaluarse con benchmarks de LLM.
- Riesgo de seguridad alto: distribución de un `.exe` con contraseña fija (`2026`), instrucción de ejecutar como administrador y enlaces a binarios alojados en un repositorio de GitHub no vinculado al autor del Hub.
- Nombres de fichero incongruentes (`kingdom-come-deliverance-2-trainer-...`) que apuntan a una plantilla reutilizada o a un señuelo.
- Métricas de popularidad falsas o no verificables en la model card ("781K+ descargas", "5.0/5") frente a 0 descargas y 0 likes reales en el Hub.
- Posible fraude financiero: la propuesta de valor implica gestionar claves y órdenes de trading; la gestión local de claves AES-256 no es auditable sin código fuente.
- Licencia MIT declarada sin código fuente ni titular identificable; no ofrece garantía jurídica ni técnica.
- Idiomas: la lista de 14 idiomas es solo metadato; no hay evidencia de soporte real.
- Alucinación y sesgos: no aplica como modelo, pero la documentación contiene afirmaciones no sustentadas que deben tratarse como desinformación.
- Recomendación: no ejecutar en producción, no conectar a carteras reales, no integrar como servidor MCP en agentes con permisos.

## Enlaces

- Hugging Face: https://huggingface.co/LouieSaintST1/krypolybot-polymarket-mcp-whale-trader
- Repositorio de GitHub enlazado en la model card (tercero, no verificado): https://github.com/ErikMercier70637/kingdom-come-deliverance-2-trainer-2026
- Releases enlazadas en la model card (tercero, no verificado): https://github.com/lori1635/krypolybot-polymarket-mcp-whale-trader/releases/latest
- Documentación de Model Context Protocol (referencia de la tecnología que invoca el nombre): https://modelcontextprotocol.io
- Polymarket (plataforma de mercados de predicción mencionada): https://polymarket.com
