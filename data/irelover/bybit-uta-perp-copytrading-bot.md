# Irelover/bybit-uta-perp-copytrading-bot

## Resumen

El artefacto publicado bajo el identificador `Irelover/bybit-uta-perp-copytrading-bot` en Hugging Face no es un modelo de inteligencia artificial, sino un supuesto ejecutable para Windows de 64 bits empaquetado en un archivo ZIP de 8,9 MB. La model card se limita a describir un bot de copytrading para perpetuos de Bybit sobre la interfaz UTA, con funciones de enrutamiento de órdenes, gestión de claves y filtros antifraude. No se declara ninguna arquitectura de red neuronal, ningún número de parámetros, ningún corpus de entrenamiento ni ningún proceso de alineación.

El repositorio carece de pipeline declarado, de pesos en formato safetensors o GGUF y de cualquier artefacto propio de un modelo de lenguaje. Las etiquetas del autor (`windows`, `x64`, `portable`) confirman que se trata de una distribución binaria, no de un modelo. Las descargas y los "me gusta" registrados son cero en el momento de la consulta, pese a que la propia model card afirma cifras de 173 000 descargas y un build `v1.5.2 (238FE6)`, lo que constituye una contradicción directa con los metadatos de la plataforma.

Desde la perspectiva de la evaluación de modelos, la ficha no puede completarse con datos técnicos reales porque no existen. Se documenta a continuación lo que sí está disponible, con advertencias explícitas sobre los indicios de riesgo que presenta la publicación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos; sin evidencia de capacidades lingüísticas reales) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` de Windows) |

## Arquitectura y entrenamiento

No se declara arquitectura de modelo. La documentación describe subsistemas de un programa de trading: enrutamiento de órdenes con latencia inferior a 40 ms mediante WebSocket y gRPC, un almacén local de claves AES-256, un agrupador de 20 carteras con Lookup Tables, objetivos de take profit escalonados, un filtro previo a la compra de tipo honeypot y replicación de carteras de "smart money". Estos componentes son propios de un bot de ejecución financiera, no de un transformer, un modelo MoE ni una arquitectura híbrida SSM.

No hay información sobre datos de entrenamiento, número de tokens, composición del corpus, RLHF, DPO ni ninguna innovación de inferencia como decodificación especulativa o atención lineal. Los únicos datos numéricos de la model card (8,9 MB, `372 Hz` de sondeo, `147 Hz`, `98,7%` de consistencia, `< 19 ms` de respuesta) son afirmaciones de marketing sin verificación independiente y no guardan relación con métricas de modelos.

## Capacidades

- No se documenta ninguna capacidad de generación de texto, razonamiento, código, matemáticas ni visión.
- No se declara soporte de tool calling ni de function calling en el sentido de los modelos de lenguaje.
- No se declara soporte de agentes ni de razonamiento multi-paso.
- El multilingüismo indicado en los metadatos (14 idiomas) no está respaldado por ninguna evaluación ni descripción funcional.
- Las funciones descritas son exclusivamente de operativa de trading: enrutamiento de órdenes, firma local de transacciones, gestión de carteras y filtros antifraude.
- No hay modo "thinking", ni entrada de audio, ni procesamiento de imágenes.

## Casos de uso

- No procede. El artefacto no es un modelo de IA y no puede emplearse en tareas de generación, clasificación, extracción ni razonamiento.
- Su único propósito declarado es la ejecución automatizada de operaciones en perpetuos de Bybit, actividad sujeta a regulación financiera y a los términos de servicio del exchange.
- Cualquier uso en producción requeriría auditar el binario, algo imposible a partir de la documentación publicada.
- No se recomienda su descarga ni ejecución: la combinación de ejecutable sin firma verificable, contraseña de descompresión fija y enlaces a un repositorio de GitHub de terceros es un patrón habitual de distribución de software malicioso.
- Para necesidades reales de trading algorítmico, la vía adecuada es la API oficial de Bybit con bibliotecas auditadas y control de claves propio.
- Para necesidades de IA, debe seleccionarse un modelo con pesos publicados, arquitectura declarada y benchmarks reproducibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica, no es un modelo.
- GPU recomendadas: no aplica.
- Ejecución en GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: las cifras de la model card (`< 40 ms` de enrutamiento, `372 Hz` de sondeo) no son verificables ni corresponden a métricas de inferencia.
- Plataforma declarada: Windows 10 u 11 de 64 bits, con ejecución "como administrador".

## Comparativa con modelos similares

| Criterio | Este artefacto | Modelo de lenguaje open source típico (p. ej. familia Llama, Qwen o Mistral) |
|---|---|---|
| Naturaleza | Ejecutable de Windows en ZIP | Pesos de red neuronal |
| Pesos publicados | No | Sí (safetensors, GGUF) |
| Arquitectura declarada | No | Sí (transformer, MoE, híbrida) |
| Parámetros | No disponible | Declarados por variante |
| Contexto | No disponible | Declarado (8K a 1M tokens según modelo) |
| Benchmarks reproducibles | No | Habituales (MMLU, HumanEval, GSM8K) |
| Licencia | MIT (sobre el binario) | MIT, Apache 2.0 o licencias comunitarias |
| Verificabilidad | Nula | Alta, con pesos y configuraciones auditables |

## Limitaciones y advertencias

- No es un modelo de IA: la ficha se completa únicamente para dejar constancia de la naturaleza del artefacto y de los riesgos asociados.
- Contradicción entre metadatos y model card: la plataforma registra 0 descargas y 0 "me gusta", mientras la documentación afirma 173 000 descargas.
- Distribución mediante un ejecutable `.exe` alojado en un repositorio de GitHub ajeno al autor declarado, con contraseña de descompresión fija (`2026`), patrón frecuente en campañas de malware.
- Solicitud de ejecución "como administrador" sin justificación técnica ni firma de código verificable.
- Ausencia total de código fuente, hashes de integridad y análisis de terceros.
- Riesgo financiero directo: un bot de trading con acceso a claves y órdenes en perpetuos puede provocar pérdidas patrimoniales, y la gestión local de claves AES-256 no está auditada.
- Riesgo regulatorio: el copytrading y el trading de derivados están sujetos a restricciones en la Unión Europea y en España bajo MiCA y la normativa de la CNMV.
- La licencia MIT se aplica, según la declaración, al paquete binario; no hay garantía alguna sobre su comportamiento en ejecución.
- No debe descomprimirse ni ejecutarse en entornos de producción ni en máquinas con credenciales de valor.

## Enlaces

- Hugging Face: https://huggingface.co/Irelover/bybit-uta-perp-copytrading-bot
- Repositorio de GitHub referenciado en la model card: https://github.com/Sarag51632/bybit-uta-perp-copytrading-bot
- Releases referenciadas: https://github.com/Sarag51632/bybit-uta-perp-copytrading-bot/releases/latest
- Paper, blog técnico, demo o repositorio oficial del modelo: no disponible
